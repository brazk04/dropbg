import type {
  BackgroundRemovalStatus,
  ModelProgress,
} from "@/lib/background-removal/types";
export function ProcessingFeedback({
  status,
  progress,
  error,
}: {
  status: BackgroundRemovalStatus;
  progress: ModelProgress;
  error: string | null;
}) {
  if (status === "error")
    return (
      <p className="processing-error" role="alert">
        {error}
      </p>
    );
  if (
    status !== "loading-model" &&
    status !== "processing" &&
    status !== "refining"
  )
    return null;
  return (
    <div className="processing-feedback">
      <div className="processing-label" role="status">
        <span>
          {status === "loading-model"
            ? "Preparando o DropBG…"
            : status === "refining"
              ? "Finalizando recorte…"
              : "Removendo fundo…"}
        </span>
        {status === "loading-model" && progress.percent !== null && (
          <span>{Math.floor(progress.percent)}%</span>
        )}
      </div>
      {status === "loading-model" ? (
        <>
          <progress
            className="model-progress"
            aria-label="Carregamento do modelo"
            max={100}
            value={progress.percent ?? undefined}
          />
          <p>
            {progress.percent !== null && progress.percent >= 100
              ? "Download concluído. Inicializando o modelo…"
              : "Na primeira utilização, baixamos o modelo de IA. Sua imagem permanece no dispositivo."}
          </p>
        </>
      ) : (
        <p>A imagem está sendo processada no seu dispositivo.</p>
      )}
    </div>
  );
}
