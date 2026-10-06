import { clampAlpha, neighborhood } from "./alpha-mask";
import type { EdgeMode } from "./types";
export function resolutionRadius(width: number, height: number) {
  return Math.min(2, Math.max(width, height) / 2000);
}
export function refineEdgeAlpha(
  alpha: number,
  neighbors: ReturnType<typeof neighborhood>,
  smoothing: number,
  mode: EdgeMode,
  radius: number,
) {
  // Não mexe em transparência zero nem em detalhes opacos com pouco suporte.
  if (!alpha && mode !== "expand") return 0;
  if (alpha === 255 && neighbors.support < 6) return alpha;
  let value = alpha;
  if (mode !== "neutral" && neighbors.support >= 3) {
    const target = mode === "contract" ? neighbors.min : neighbors.max;
    value += (target - alpha) * Math.min(0.15, radius * 0.075);
  }
  if (alpha > 0 && alpha < 255 && neighbors.max - neighbors.min > 24)
    value += Math.max(-6, Math.min(6, (neighbors.mean - alpha) * smoothing));
  else if (alpha === 255 && neighbors.min === 0 && neighbors.support >= 6)
    value -= (2 * smoothing) / 0.12;
  // Alpha parcial permanece parcial: sem threshold ou opacificação automática.
  if (alpha > 0 && alpha < 255) value = Math.max(1, Math.min(254, value));
  return clampAlpha(value);
}
