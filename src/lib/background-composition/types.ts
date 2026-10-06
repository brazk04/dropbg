export type BackgroundOption =
  | { type: "transparent" }
  | { type: "color"; value: string; preset?: string }
  | { type: "image"; file: File; url: string; width: number; height: number };

export const BACKGROUND_PRESETS = [
  { id: "white", label: "Branco", token: "--background-white" },
  { id: "black", label: "Preto", token: "--background-black" },
  { id: "gray", label: "Cinza claro", token: "--background-gray" },
  { id: "blue", label: "Azul DropBG", token: "--primary" },
] as const;

export function normalizeHex(value: string): string | null {
  if (!/^#[\da-f]{3}([\da-f]{3})?$/i.test(value)) return null;
  return (
    value.length === 4
      ? "#" + [...value.slice(1)].map((char) => char + char).join("")
      : value
  ).toUpperCase();
}

export function coverRect(
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale,
    drawHeight = sourceHeight * scale;
  return {
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}
