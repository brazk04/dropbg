import type { PixelImage } from "./types";
// RGB é straight/unassociated. Nunca multiplicamos RGB por alpha antes de gravar PNG.
export function decontaminateEdge(
  original: PixelImage,
  mask: Uint8Array,
  x: number,
  y: number,
  alpha: number,
  strength: number,
  limit: number,
): [number, number, number] | null {
  if (alpha < 24 || alpha > 232) return null;
  const center = (y * original.width + x) * original.channels;
  if (original.channels === 4 && original.data[center + 3] < 255) return null;
  let foreground = -1,
    second = -1,
    background = -1;
  let fgDistance = Infinity,
    bgDistance = Infinity;
  // Busca limitada a 2 px; sem preencher cores de áreas internas ou fios sem âncora.
  for (
    let row = Math.max(0, y - 2);
    row <= Math.min(original.height - 1, y + 2);
    row++
  )
    for (
      let col = Math.max(0, x - 2);
      col <= Math.min(original.width - 1, x + 2);
      col++
    ) {
      const pixel = row * original.width + col;
      const distance = (row - y) ** 2 + (col - x) ** 2;
      if (mask[pixel] >= 250 && distance < fgDistance) {
        second = foreground;
        foreground = pixel;
        fgDistance = distance;
      } else if (mask[pixel] >= 250 && second < 0) second = pixel;
      if (mask[pixel] <= 3 && distance < bgDistance) {
        background = pixel;
        bgDistance = distance;
      }
    }
  if (foreground < 0 || second < 0 || background < 0) return null;
  const fg = foreground * original.channels,
    other = second * original.channels,
    bg = background * original.channels;
  const f = [0, 1, 2].map(
    (channel) =>
      (original.data[fg + channel] + original.data[other + channel]) / 2,
  );
  const v = [0, 1, 2].map(
    (channel) => original.data[bg + channel] - f[channel],
  );
  const delta = [0, 1, 2].map(
    (channel) => original.data[center + channel] - f[channel],
  );
  if (
    [0, 1, 2].some(
      (channel) =>
        Math.abs(original.data[fg + channel] - original.data[other + channel]) >
        24,
    )
  )
    return null;
  const contrast = v.reduce((sum, value) => sum + value * value, 0);
  if (contrast < 45 * 45) return null;
  const contamination =
    delta.reduce((sum, value, channel) => sum + value * v[channel], 0) /
    contrast;
  if (
    contamination < 0.03 ||
    contamination > 0.85 ||
    Math.abs(contamination - (1 - alpha / 255)) > 0.25
  )
    return null;
  const residual = delta.reduce(
    (sum, value, channel) => sum + (value - contamination * v[channel]) ** 2,
    0,
  );
  if (residual > 18 * 18) return null;
  return [0, 1, 2].map((channel) =>
    Math.max(
      0,
      Math.min(
        255,
        Math.round(
          original.data[center + channel] -
            Math.max(
              -limit,
              Math.min(limit, contamination * v[channel] * strength),
            ),
        ),
      ),
    ),
  ) as [number, number, number];
}
