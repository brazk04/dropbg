import { useRef, useState } from "react";
import {
  BACKGROUND_PRESETS,
  normalizeHex,
  type BackgroundOption,
} from "@/lib/background-composition/types";
import { IMAGE_ACCEPT } from "@/lib/constants";

export function BackgroundControls({
  background,
  onSelect,
  onImage,
  disabled,
  reading,
}: {
  background: BackgroundOption;
  onSelect: (value: BackgroundOption) => void;
  onImage: (file: File) => void;
  disabled: boolean;
  reading: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState("#EAF1F8");
  const [invalid, setInvalid] = useState(false);
  const custom = background.type === "color" && !background.preset;
  const updateHex = (value: string) => {
    setHex(value);
    const normalized = normalizeHex(value);
    setInvalid(!normalized);
    if (normalized) onSelect({ type: "color", value: normalized });
  };
  return (
    <section className="background-controls" aria-label="Personalizar fundo">
      <span className="background-title">Fundo</span>
      <div
        className="background-presets"
        role="group"
        aria-label="Fundos predefinidos"
      >
        <button
          type="button"
          disabled={disabled}
          aria-pressed={background.type === "transparent"}
          onClick={() => onSelect({ type: "transparent" })}
        >
          <span className="background-swatch transparent-grid" />
          Transparente
        </button>
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.id}
            disabled={disabled}
            aria-pressed={
              background.type === "color" && background.preset === preset.id
            }
            onClick={() =>
              onSelect({
                type: "color",
                preset: preset.id,
                value: getComputedStyle(document.documentElement)
                  .getPropertyValue(preset.token)
                  .trim(),
              })
            }
          >
            <span
              className="background-swatch"
              style={{ background: `var(${preset.token})` }}
            />
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={custom}
          onClick={() => {
            const value = normalizeHex(hex) ?? "#EAF1F8";
            setHex(value);
            setInvalid(false);
            onSelect({ type: "color", value });
          }}
        >
          + Cor personalizada
        </button>
      </div>
      {custom && (
        <div className="background-color-fields">
          <label>
            Cor{" "}
            <input
              type="color"
              aria-label="Escolher cor personalizada"
              disabled={disabled}
              value={normalizeHex(hex) ?? "#EAF1F8"}
              onChange={(event) => updateHex(event.target.value)}
            />
          </label>
          <label>
            HEX{" "}
            <input
              type="text"
              aria-label="Cor hexadecimal"
              aria-invalid={invalid}
              disabled={disabled}
              value={hex}
              maxLength={7}
              spellCheck={false}
              onChange={(event) => updateHex(event.target.value)}
            />
          </label>
          {invalid && <span role="status">Use #RGB ou #RRGGBB.</span>}
        </div>
      )}
      <div className="background-image-actions">
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label="Selecionar imagem de fundo"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImage(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={disabled || reading}
          onClick={() => input.current?.click()}
        >
          {reading
            ? "Abrindo fundo…"
            : background.type === "image"
              ? "Trocar imagem de fundo"
              : "Adicionar imagem de fundo"}
        </button>
        {background.type === "image" && (
          <>
            <span className="file-name" title={background.file.name}>
              {background.file.name}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect({ type: "transparent" })}
            >
              Remover fundo personalizado
            </button>
          </>
        )}
      </div>
    </section>
  );
}
