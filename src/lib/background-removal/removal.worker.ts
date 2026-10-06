import type {
  BackgroundRemovalPipeline,
  ProgressInfo,
  RawImage,
} from "@huggingface/transformers";
import { supportsWebGPU } from "./capabilities";
import { validateDimensions } from "@/lib/image";
import { refineBackgroundRemoval } from "./refinement/refine-result";
import { encodeRefinedPng } from "./refinement/encode-result";
import type {
  EngineUpdate,
  ExecutionDevice,
  WorkerRequest,
  WorkerResponse,
} from "./types";

const MODEL = "xrds/isnet-general-onnx-int8";
const REVISION = "71eff2372ec9c8edbc6ca637ded591423d23b65a";
let runtime: Promise<typeof import("@huggingface/transformers")> | null = null;
let pipelineInstance: BackgroundRemovalPipeline | null = null;
let initialization: Promise<BackgroundRemovalPipeline> | null = null;
let device: ExecutionDevice = "wasm";
let busy = false;
class RetryWithWasm extends Error {}

function debug(message: string, error: unknown) {
  if (process.env.NODE_ENV === "development")
    console.warn(`DropBG: ${message}`, error);
}
function send(message: WorkerResponse) {
  self.postMessage(message);
}

async function getRuntime() {
  runtime ??= import("@huggingface/transformers")
    .then((module) => {
      module.env.allowLocalModels = false;
      module.env.useBrowserCache = true;
      module.env.useWasmCache = true;
      module.env.logLevel =
        process.env.NODE_ENV === "development"
          ? module.LogLevel.WARNING
          : module.LogLevel.NONE;
      // Um worker dedicado evita bloquear a UI mesmo sem SharedArrayBuffer/COOP/COEP.
      if (module.env.backends.onnx.wasm)
        module.env.backends.onnx.wasm.numThreads = 1;
      return module;
    })
    .catch((error) => {
      runtime = null;
      throw error;
    });
  return runtime;
}

async function initialize(
  onUpdate: (update: EngineUpdate) => void,
  forceWasm = false,
) {
  if (pipelineInstance) return pipelineInstance;
  if (initialization) return initialization;
  onUpdate({ status: "loading-model", progress: { percent: null } });
  initialization = (async () => {
    const { pipeline } = await getRuntime();
    const progress_callback = (event: ProgressInfo) => {
      if (event.status === "progress_total" || event.status === "progress") {
        onUpdate({
          status: "loading-model",
          progress: {
            percent:
              Number.isFinite(event.progress) && event.total > 0
                ? Math.min(100, Math.max(0, event.progress))
                : null,
            file: event.status === "progress" ? event.file : undefined,
          },
        });
      }
    };
    const load = (target: ExecutionDevice) =>
      pipeline("background-removal", MODEL, {
        revision: REVISION,
        dtype: "q8",
        device: target,
        progress_callback,
      });
    if (!forceWasm && (await supportsWebGPU())) {
      try {
        pipelineInstance = await load("webgpu");
        device = "webgpu";
        return pipelineInstance;
      } catch (error) {
        debug("WebGPU indisponível para este modelo; usando WASM.", error);
        throw new RetryWithWasm();
      }
    }
    pipelineInstance = await load("wasm");
    device = "wasm";
    return pipelineInstance;
  })();
  try {
    return await initialization;
  } finally {
    initialization = null;
  }
}

async function infer(
  original: RawImage,
  onUpdate: (update: EngineUpdate) => void,
) {
  const segmenter = await initialize(onUpdate);
  onUpdate({ status: "processing", device });
  try {
    return await segmenter(original);
  } catch (error) {
    if (device !== "webgpu") throw error;
    debug("Inferência WebGPU falhou; tentando WASM.", error);
    // A thread principal recria o worker para evitar reutilizar um runtime
    // com device perdido ou cadeia de inferência rejeitada.
    throw new RetryWithWasm();
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, file, forceWasm = false } = event.data;
  if (busy) {
    send({
      id,
      type: "error",
      message: "Aguarde o processamento da imagem atual.",
    });
    return;
  }
  busy = true;
  let stage = "loading";
  const onUpdate = (update: EngineUpdate) => {
    stage = update.status === "loading-model" ? "loading" : update.status;
    send({ id, type: "update", update });
  };
  try {
    await initialize(onUpdate, forceWasm);
    stage = "input";
    const { RawImage } = await getRuntime();
    const original = await RawImage.read(file);
    const invalid = validateDimensions(original.width, original.height);
    if (invalid) throw new Error(invalid);
    stage = "processing";
    const clock =
      process.env.NODE_ENV === "development" ? performance.now() : 0;
    const result = await infer(original, onUpdate);
    const aiFinished =
      process.env.NODE_ENV === "development" ? performance.now() : 0;
    if (
      Array.isArray(result) ||
      result.channels !== 4 ||
      result.width !== original.width ||
      result.height !== original.height
    ) {
      throw new Error(
        "O motor retornou uma imagem com dimensões ou canais inesperados.",
      );
    }
    // Preserva também a transparência que já existia no arquivo de entrada.
    if (original.channels === 4) {
      for (let i = 3; i < result.data.length; i += 4)
        result.data[i] = Math.round((result.data[i] * original.data[i]) / 255);
    }
    stage = "output";
    const rawBlob = await result.toBlob("image/png");
    let blob = rawBlob;
    let refinementAvailable = false;
    onUpdate({ status: "refining", device });
    const refinementStarted =
      process.env.NODE_ENV === "development" ? performance.now() : 0;
    try {
      // Resultado bruto já codificado: podemos refinar o buffer no lugar sem cópia RGBA.
      // Uma máscara de 1 byte/pixel é a única cópia integral adicional.
      const memory = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory;
      if (memory && memory <= 2 && result.width * result.height > 8_000_000)
        throw new Error("Refinement skipped on low-memory device.");
      const refined = refineBackgroundRemoval(original, result, {
        profile: "balanced",
        inPlace: true,
      });
      blob = await encodeRefinedPng(result);
      if (!blob.size || blob.type !== "image/png")
        throw new Error("Invalid refined PNG.");
      refinementAvailable = true;
      if (process.env.NODE_ENV === "development")
        console.info("DropBG refinement:", refined.stats);
    } catch (error) {
      debug("Refinamento indisponível; preservando recorte bruto.", error);
      blob = rawBlob;
    }
    if (process.env.NODE_ENV === "development") {
      const end = performance.now();
      console.info("DropBG timings (ms):", {
        inference: Math.round(aiFinished - clock),
        refinement: Math.round(end - refinementStarted),
        total: Math.round(end - clock),
      });
    }
    if (!blob.size || blob.type !== "image/png")
      throw new Error("Resultado PNG inválido.");
    send({
      id,
      type: "result",
      result: {
        blob,
        rawBlob,
        refinementAvailable,
        width: result.width,
        height: result.height,
        device,
      },
    });
  } catch (error) {
    if (error instanceof RetryWithWasm) {
      send({ id, type: "fallback-wasm" });
      return;
    }
    debug(`Falha durante ${stage}.`, error);
    const detail = error instanceof Error ? error.message : "";
    const memoryError = /memory|allocation|out of bounds/i.test(detail);
    const message = memoryError
      ? "Seu dispositivo ficou sem memória para esta imagem. Feche outras abas ou tente uma imagem menor."
      : stage === "loading"
        ? "Não foi possível preparar o modelo. Confira sua conexão e tente novamente."
        : stage === "input"
          ? "Não foi possível abrir a imagem para processamento. Verifique o arquivo e tente outra imagem."
          : stage === "output"
            ? "Não foi possível gerar o PNG. Tente novamente ou escolha uma imagem menor."
            : "Não conseguimos processar esta imagem. Tente outra imagem ou tente novamente.";
    send({ id, type: "error", message });
  } finally {
    busy = false;
  }
};
