import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
export function UploadZone({
  onSelect,
  loading,
  dragging,
}: {
  onSelect: () => void;
  loading: boolean;
  dragging: boolean;
}) {
  return (
    <div className="upload-zone">
      <div className="upload-symbol">
        <Icon name="upload" width="28" height="28" />
      </div>
      <h2>{dragging ? "Solte para adicionar" : "Solte sua imagem aqui"}</h2>
      <p>ou clique para selecionar</p>
      <Button onClick={onSelect} disabled={loading}>
        {loading ? "Carregando imagem…" : "Selecionar imagem"}
      </Button>
      <span className="formats">
        PNG <span>•</span> JPG <span>•</span> JPEG <span>•</span> WEBP{" "}
        <span className="size-limit">/ até 25 MB</span>
      </span>
    </div>
  );
}
