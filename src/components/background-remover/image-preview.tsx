import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TransparentGrid } from "@/components/ui/transparent-grid";
import { formatFileSize } from "@/lib/image";
import type { LocalImage } from "@/types/image";
import { ProcessingFeedback } from "./processing-feedback";
import type {
  BackgroundRemovalStatus,
  ModelProgress,
} from "@/lib/background-removal/types";
export function ImagePreview({
  image,
  loading,
  onSelect,
  onRemove,
  onProcess,
  status,
  progress,
  error,
}: {
  image: LocalImage;
  loading: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onProcess: () => void;
  status: BackgroundRemovalStatus;
  progress: ModelProgress;
  error: string | null;
}) {
  return (
    <div className="image-preview">
      <div className="preview-heading">
        <span>
          <span className="status-dot" /> Imagem original
        </span>
        <Button
          variant="ghost"
          onClick={onRemove}
          disabled={loading}
          aria-label="Remover imagem"
        >
          <Icon name="close" /> Remover
        </Button>
      </div>
      <TransparentGrid className="preview-canvas">
        <Image
          src={image.url}
          alt={`Preview da imagem original: ${image.file.name}`}
          width={image.width}
          height={image.height}
          unoptimized
          className="local-preview"
        />
        {(status === "loading-model" ||
          status === "processing" ||
          status === "refining") && (
          <div className="processing-overlay">
            <span className="processing-spinner" aria-hidden="true" />
            {status === "refining"
              ? "Finalizando recorte…"
              : status === "processing"
                ? "Removendo fundo…"
                : "Preparando o DropBG…"}
          </div>
        )}
      </TransparentGrid>
      <div className="preview-details">
        <span className="file-name">{image.file.name}</span>
        <span>
          {image.width} × {image.height} · {formatFileSize(image.file.size)}
        </span>
      </div>
      <div className="preview-actions">
        <Button variant="secondary" onClick={onSelect} disabled={loading}>
          {loading ? "Carregando…" : "Trocar imagem"}
        </Button>
        <Button onClick={onProcess} disabled={loading}>
          {status === "loading-model"
            ? "Preparando…"
            : status === "refining"
              ? "Finalizando…"
              : status === "processing"
                ? "Removendo fundo…"
                : status === "error"
                  ? "Tentar novamente"
                  : "Remover fundo"}{" "}
          <Icon name="arrow" />
        </Button>
      </div>
      <ProcessingFeedback status={status} progress={progress} error={error} />
    </div>
  );
}
