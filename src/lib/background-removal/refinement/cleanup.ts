// Só remove um ponto fraco totalmente isolado. Fios conectados e pontos fortes ficam intactos.
export function cleanupAlpha(
  mask: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const alpha = mask[y * width + x];
  if (!alpha || alpha > 12) return alpha;
  for (let row = Math.max(0, y - 1); row <= Math.min(height - 1, y + 1); row++)
    for (let col = Math.max(0, x - 1); col <= Math.min(width - 1, x + 1); col++)
      if ((row !== y || col !== x) && mask[row * width + col] > 0) return alpha;
  return 0;
}
