import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { BeforeAfterSlider, type ViewMode } from "./before-after-slider";
import { ResultActions } from "./result-actions";
import type { LocalImage } from "@/types/image";
import type { RemovalResult } from "@/lib/background-removal/types";
import { useBackgroundComposition } from "@/hooks/use-background-composition";
import { BackgroundControls } from "./background-controls";
export function ImageResult({
  result,
  original,
  onRemove,
  loading,
}: {
  result: RemovalResult;
  original: LocalImage;
  onRemove: () => void;
  loading: boolean;
}) {
  const [mode, setMode] = useState<ViewMode>("compare");
  const [refine, setRefine] = useState(true);
  const foreground = refine
    ? result
    : { ...result, blob: result.rawBlob, url: result.rawUrl };
  const composition = useBackgroundComposition(foreground);
  return (
    <div
      className="image-preview result-preview"
      data-processing-device={result.device}
    >
      <div className="preview-heading">
        <span role="status">
          <Icon name="check" /> Resultado
        </span>
        <Button
          variant="ghost"
          onClick={onRemove}
          disabled={loading || composition.exporting}
          aria-label="Remover imagem"
        >
          <Icon name="close" /> Remover
        </Button>
      </div>
      <div className="result-toolbar">
        <span className="result-ready">Fundo removido</span>
        <div
          className="view-modes"
          role="group"
          aria-label="Modo de visualização"
        >
          {(
            [
              ["compare", "Comparar"],
              ["result", "Resultado"],
              ["original", "Original"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <BeforeAfterSlider
        originalUrl={original.url}
        resultUrl={foreground.url}
        width={result.width}
        height={result.height}
        mode={mode}
        background={composition.background}
      />
      <label className="refinement-control">
        <input
          type="checkbox"
          checked={refine && result.refinementAvailable}
          disabled={composition.exporting || !result.refinementAvailable}
          onChange={(event) => setRefine(event.target.checked)}
        />
        <span>
          Refinar bordas
          <small>
            {result.refinementAvailable
              ? "Suaviza contornos e reduz resíduos do fundo."
              : "Recorte original disponível; refinamento não aplicado neste dispositivo."}
          </small>
        </span>
      </label>
      <BackgroundControls
        background={composition.background}
        onSelect={composition.select}
        onImage={composition.addImage}
        disabled={composition.exporting}
        reading={composition.reading}
      />
      {composition.error && (
        <p className="composition-error" role="alert">
          {composition.error}
        </p>
      )}
      <ResultActions
        result={foreground}
        onNewImage={onRemove}
        loading={loading || composition.exporting || composition.reading}
        background={composition.background}
        exporting={composition.exporting}
        onDownload={composition.download}
      />
    </div>
  );
}
