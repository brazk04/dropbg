"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalImage } from "@/hooks/use-local-image";
import { IMAGE_ACCEPT } from "@/lib/constants";
import { UploadZone } from "./upload-zone";
import { ImagePreview } from "./image-preview";
import { Toast } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";
import { useBackgroundRemoval } from "@/hooks/use-background-removal";
import { ImageResult } from "./image-result";
export function BackgroundRemover() {
  const removal = useBackgroundRemoval();
  const { image, loading, notice, setNotice, addImage, removeImage } =
    useLocalImage({ isLocked: removal.isRunning, onChange: removal.reset });
  const busy = loading || removal.busy;
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const dismiss = useCallback(() => setNotice(null), [setNotice]);
  useEffect(() => {
    const prevent = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);
  const select = () => {
    if (!removal.isRunning()) input.current?.click();
  };
  return (
    <section
      id="ferramenta"
      className="tool-section container"
      aria-label="Adicionar imagem"
      aria-busy={busy}
    >
      <div className="tool-topline">
        <span>Adicione uma imagem</span>
        <span className="local-label">
          <Icon name="shield" width="14" height="14" /> Processamento local
        </span>
      </div>
      <div
        className={`upload-panel ${dragging ? "is-dragging" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (removal.isRunning()) return;
          if (event.dataTransfer.types.includes("Files")) {
            dragDepth.current++;
            setDragging(true);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (removal.isRunning()) return;
          const files = event.dataTransfer.files;
          if (files.length > 1) {
            setNotice({
              kind: "error",
              message: "Adicione uma imagem de cada vez.",
            });
            return;
          }
          if (files[0]) void addImage(files[0], "drop");
        }}
      >
        <input
          ref={input}
          className="sr-only"
          type="file"
          disabled={busy}
          accept={IMAGE_ACCEPT}
          tabIndex={-1}
          aria-label="Selecionar arquivo de imagem"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void addImage(file, "picker");
            event.target.value = "";
          }}
        />
        {removal.result && image ? (
          <ImageResult
            key={removal.result.url}
            result={removal.result}
            original={image}
            onRemove={removeImage}
            loading={busy}
          />
        ) : image ? (
          <ImagePreview
            image={image}
            loading={busy}
            onSelect={select}
            onRemove={removeImage}
            status={removal.status}
            progress={removal.modelProgress}
            error={removal.error}
            onProcess={() => {
              setNotice(null);
              void removal.processImage(image.file);
            }}
          />
        ) : (
          <UploadZone onSelect={select} loading={loading} dragging={dragging} />
        )}
      </div>
      <div className="tool-bottomline">
        <span>
          Você também pode colar uma imagem com <kbd>Ctrl</kbd> + <kbd>V</kbd>
        </span>
        <span>
          <Icon name="shield" width="14" height="14" /> Processado no seu
          dispositivo.
        </span>
      </div>
      <p className="phase-note">
        O modelo é baixado na primeira utilização e reutilizado nas próximas.
      </p>
      <Toast notice={notice} onDismiss={dismiss} />
    </section>
  );
}
