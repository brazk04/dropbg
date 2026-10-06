import Image from "next/image";
import { useState } from "react";
import { TransparentGrid } from "@/components/ui/transparent-grid";
import { CompositePreview } from "./composite-preview";
import type { BackgroundOption } from "@/lib/background-composition/types";

export type ViewMode = "compare" | "result" | "original";

export function BeforeAfterSlider({
  originalUrl,
  resultUrl,
  width,
  height,
  mode,
  background,
}: {
  originalUrl: string;
  resultUrl: string;
  width: number;
  height: number;
  mode: ViewMode;
  background: BackgroundOption;
}) {
  const [position, setPosition] = useState(50);
  const move = (clientX: number, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.width)
      setPosition(
        Math.max(
          0,
          Math.min(100, ((clientX - bounds.left) / bounds.width) * 100),
        ),
      );
  };
  return (
    <TransparentGrid
      className={`preview-canvas comparison-canvas ${background.type !== "transparent" && mode !== "original" ? "composition-opaque" : ""}`}
      onPointerDown={(event) => {
        if (mode !== "compare" || !event.isPrimary || event.button !== 0)
          return;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget
          .querySelector<HTMLElement>('[role="slider"]')
          ?.focus({ preventScroll: true });
        move(event.clientX, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (
          mode === "compare" &&
          event.currentTarget.hasPointerCapture(event.pointerId)
        )
          move(event.clientX, event.currentTarget);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      style={{ touchAction: mode === "compare" ? "pan-y" : "auto" }}
    >
      {mode !== "original" && (
        <CompositePreview
          url={resultUrl}
          width={width}
          height={height}
          background={background}
        />
      )}
      {mode !== "result" && (
        <div
          className="comparison-original"
          style={{
            clipPath:
              mode === "compare"
                ? `inset(0 ${100 - position}% 0 0)`
                : undefined,
          }}
        >
          <div className="composition-layer">
            <div
              className="composition-frame transparent-grid"
              style={{
                aspectRatio: `${width} / ${height}`,
                maxWidth: `calc(var(--preview-height) * ${width / height})`,
              }}
            >
              <Image
                src={originalUrl}
                alt="Imagem original para comparação"
                width={width}
                height={height}
                unoptimized
                draggable={false}
                className="comparison-image"
              />
            </div>
          </div>
        </div>
      )}
      {mode !== "result" && (
        <span className="comparison-label comparison-label-original">
          Original
        </span>
      )}
      {mode !== "original" && (
        <span className="comparison-label comparison-label-result">
          Sem fundo
        </span>
      )}
      {mode === "compare" && (
        <div className="comparison-divider" style={{ left: `${position}%` }}>
          <div
            className="comparison-handle"
            role="slider"
            tabIndex={0}
            aria-label="Comparar original e imagem sem fundo"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-valuetext={`${Math.round(position)}% da imagem original`}
            onKeyDown={(event) => {
              const changes: Record<string, number> = {
                ArrowLeft: Math.max(0, position - 5),
                ArrowRight: Math.min(100, position + 5),
                Home: 0,
                End: 100,
              };
              if (event.key in changes) {
                event.preventDefault();
                setPosition(changes[event.key]);
              }
            }}
          >
            <span aria-hidden="true">↔</span>
          </div>
        </div>
      )}
    </TransparentGrid>
  );
}
