export type BackgroundRemovalStatus =
  "idle" | "loading-model" | "processing" | "refining" | "success" | "error";
export type ExecutionDevice = "webgpu" | "wasm";
export type ModelProgress = { percent: number | null; file?: string };
export type EngineUpdate =
  | { status: "loading-model"; progress: ModelProgress }
  | { status: "processing" | "refining"; device: ExecutionDevice };
// O refinamento é pós-processamento, nunca uma segunda inferência.
export type RemovalOutput = {
  blob: Blob;
  width: number;
  height: number;
  device: ExecutionDevice;
  rawBlob: Blob;
  refinementAvailable: boolean;
};
export type RemovalResult = RemovalOutput & {
  url: string;
  rawUrl: string;
  name: string;
};
export type RemovalOptions = { onUpdate?: (update: EngineUpdate) => void };
export type WorkerRequest = { id: number; file: Blob; forceWasm?: boolean };
export type WorkerResponse =
  | { id: number; type: "update"; update: EngineUpdate }
  | { id: number; type: "result"; result: RemovalOutput }
  | { id: number; type: "fallback-wasm" }
  | { id: number; type: "error"; message: string };
