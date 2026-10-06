import Image from "next/image";
import type { BackgroundOption } from "@/lib/background-composition/types";

export function CompositePreview({
  url,
  width,
  height,
  background,
}: {
  url: string;
  width: number;
  height: number;
  background: BackgroundOption;
}) {
  return (
    <div className="composition-layer">
      <div
        className={`composition-frame ${background.type === "transparent" ? "transparent-grid" : ""}`}
        data-background-type={background.type}
        style={{
          aspectRatio: `${width} / ${height}`,
          maxWidth: `calc(var(--preview-height) * ${width / height})`,
          backgroundColor:
            background.type === "color" ? background.value : undefined,
        }}
      >
        {background.type === "image" && (
          <Image
            src={background.url}
            alt=""
            aria-hidden="true"
            width={background.width}
            height={background.height}
            unoptimized
            draggable={false}
            className="composition-background"
          />
        )}
        <Image
          src={url}
          alt="Resultado com fundo transparente"
          width={width}
          height={height}
          unoptimized
          draggable={false}
          className="comparison-image composition-foreground"
        />
      </div>
    </div>
  );
}
