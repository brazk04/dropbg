import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatFileSize } from "@/lib/image";
import type { RemovalResult } from "@/lib/background-removal/types";
import type { BackgroundOption } from "@/lib/background-composition/types";

export function ResultActions({
  result,
  onNewImage,
  loading,
  background,
  exporting,
  onDownload,
}: {
  result: RemovalResult;
  onNewImage: () => void;
  loading: boolean;
  background: BackgroundOption;
  exporting: boolean;
  onDownload: () => void;
}) {
  return (
    <>
      <div className="result-metadata">
        <span className="file-name" title={result.name}>
          {result.name}
        </span>
        <span>
          PNG •{" "}
          {background.type === "transparent"
            ? "Transparente"
            : "Fundo personalizado"}{" "}
          • {result.width} × {result.height}
          {background.type === "transparent" &&
            ` • Recorte: ${formatFileSize(result.blob.size)}`}
        </span>
      </div>
      <div className="preview-actions result-actions">
        <Button variant="secondary" onClick={onNewImage} disabled={loading}>
          Nova imagem
        </Button>
        <a
          className="button button-primary"
          href={result.url}
          download={result.name}
          aria-disabled={loading}
          onClick={(event) => {
            event.preventDefault();
            if (!loading) onDownload();
          }}
        >
          {exporting ? "Gerando PNG…" : "Baixar PNG"} <Icon name="arrow" />
        </a>
      </div>
    </>
  );
}
