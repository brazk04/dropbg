import { supportsLocalProcessing } from "./capabilities";
import type { RemovalOptions, RemovalOutput, WorkerResponse } from "./types";

const JOB_TIMEOUT_MS = 5 * 60 * 1000;
type PendingJob = {
  id: number;
  file: Blob;
  retriedWasm: boolean;
  resolve: (output: RemovalOutput) => void;
  reject: (error: Error) => void;
  onUpdate: RemovalOptions["onUpdate"];
  timer: ReturnType<typeof setTimeout>;
};

class BackgroundRemovalEngine {
  private worker: Worker | null = null;
  private job: PendingJob | null = null;
  private sequence = 0;

  private initialize() {
    if (this.worker) return;
    if (!supportsLocalProcessing())
      throw new Error(
        "Este navegador não oferece os recursos necessários. Tente uma versão recente do Chrome, Edge, Firefox ou Safari.",
      );
    // Não existe import do runtime no SSR nem no bundle inicial da homepage.
    this.worker = new Worker(new URL("./removal.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      const job = this.job;
      if (!job || response.id !== job.id) return;
      if (response.type === "update") {
        job.onUpdate?.(response.update);
        return;
      }
      if (response.type === "fallback-wasm") {
        if (job.retriedWasm) {
          this.dispose(
            "Não conseguimos processar esta imagem. Tente novamente.",
          );
          return;
        }
        job.retriedWasm = true;
        // Descarta GPU, buffers e estado de inferência antes de tentar CPU.
        // O cache do navegador é preservado, evitando novo download dos pesos.
        this.worker?.terminate();
        this.worker = null;
        job.onUpdate?.({
          status: "loading-model",
          progress: { percent: null },
        });
        try {
          this.initialize();
          this.worker!.postMessage({
            id: job.id,
            file: job.file,
            forceWasm: true,
          });
        } catch {
          this.dispose(
            "Não foi possível iniciar o processamento local. Tente novamente.",
          );
        }
        return;
      }
      clearTimeout(job.timer);
      this.job = null;
      if (response.type === "result") job.resolve(response.result);
      else {
        // Uma sessão com falha pode deixar a fila interna do runtime rejeitada.
        this.worker?.terminate();
        this.worker = null;
        job.reject(new Error(response.message));
      }
    };
    this.worker.onerror = (event) => {
      event.preventDefault();
      if (process.env.NODE_ENV === "development")
        console.error("DropBG worker:", event.message);
      this.dispose(
        "Não foi possível iniciar o processamento. Atualize a página ou tente novamente.",
      );
    };
    this.worker.onmessageerror = () =>
      this.dispose("Não foi possível receber o resultado. Tente novamente.");
  }

  async remove(
    file: Blob,
    { onUpdate }: RemovalOptions = {},
  ): Promise<RemovalOutput> {
    if (this.job) throw new Error("Aguarde o processamento da imagem atual.");
    this.initialize();
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(
        () =>
          this.dispose(
            "O processamento demorou mais que o esperado. Confira sua conexão ou tente uma imagem menor.",
          ),
        JOB_TIMEOUT_MS,
      );
      this.job = {
        id,
        file,
        retriedWasm: false,
        resolve,
        reject,
        onUpdate,
        timer,
      };
      try {
        this.worker!.postMessage({ id, file });
      } catch {
        this.dispose(
          "Não foi possível abrir esta imagem para processamento. Tente novamente.",
        );
      }
    });
  }

  dispose(message = "Processamento interrompido.") {
    this.worker?.terminate();
    this.worker = null;
    if (this.job) {
      clearTimeout(this.job.timer);
      this.job.reject(new Error(message));
      this.job = null;
    }
  }
}

// Um worker e uma pipeline por aba. Trocar imagens não descarta o modelo.
export const backgroundRemovalEngine = new BackgroundRemovalEngine();
export function removeBackground(file: Blob, options?: RemovalOptions) {
  return backgroundRemovalEngine.remove(file, options);
}
