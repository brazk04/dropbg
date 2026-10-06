import type { PixelImage } from "./types";
export function clampAlpha(value: number) {
  return Math.round(
    Math.max(0, Math.min(255, Number.isFinite(value) ? value : 0)),
  );
}
export function extractAlpha(image: PixelImage) {
  if (
    image.channels !== 4 ||
    image.data.length !== image.width * image.height * 4
  )
    throw new Error("Invalid RGBA image.");
  const mask = new Uint8Array(image.width * image.height);
  for (let pixel = 0; pixel < mask.length; pixel++)
    mask[pixel] = image.data[pixel * 4 + 3];
  return mask;
}
export function neighborhood(
  mask: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  let min = 255,
    max = 0,
    sum = 0,
    count = 0,
    support = 0;
  for (let row = Math.max(0, y - 1); row <= Math.min(height - 1, y + 1); row++)
    for (
      let col = Math.max(0, x - 1);
      col <= Math.min(width - 1, x + 1);
      col++
    ) {
      const value = mask[row * width + col];
      min = Math.min(min, value);
      max = Math.max(max, value);
      sum += value;
      count++;
      if (value >= 240) support++;
    }
  return { min, max, mean: sum / count, support };
}
export function isEdge(alpha: number, min: number, max: number) {
  return (
    (alpha > 0 && alpha < 255) || (alpha === 255 && min < 240 && max - min > 32)
  );
}
