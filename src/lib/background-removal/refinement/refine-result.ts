import { extractAlpha, isEdge, neighborhood } from "./alpha-mask";
import { cleanupAlpha } from "./cleanup";
import { refineEdgeAlpha, resolutionRadius } from "./edge-refinement";
import { decontaminateEdge } from "./decontamination";
import {
  REFINEMENT_PROFILES,
  type PixelImage,
  type RefinementOptions,
  type RefinementStats,
} from "./types";

export function refineBackgroundRemoval(
  original: PixelImage,
  removed: PixelImage,
  options: RefinementOptions = {},
) {
  if (
    !Number.isInteger(original.width) ||
    !Number.isInteger(original.height) ||
    original.width <= 0 ||
    original.height <= 0 ||
    original.width !== removed.width ||
    original.height !== removed.height ||
    (original.channels !== 3 && original.channels !== 4) ||
    original.data.length !==
      original.width * original.height * original.channels
  )
    throw new Error("Invalid original dimensions.");
  const mask = extractAlpha(removed);
  const data = options.inPlace
    ? removed.data
    : new Uint8ClampedArray(removed.data);
  const profile = REFINEMENT_PROFILES[options.profile ?? "balanced"];
  const mode = options.edgeMode ?? "neutral";
  const radius = resolutionRadius(removed.width, removed.height);
  const stats: RefinementStats = {
    alphaChanged: 0,
    colorChanged: 0,
    cleaned: 0,
  };
  for (let y = 0; y < removed.height; y++)
    for (let x = 0; x < removed.width; x++) {
      const pixel = y * removed.width + x,
        offset = pixel * 4,
        alpha = mask[pixel];
      if (!alpha && mode !== "expand") {
        data[offset] = data[offset + 1] = data[offset + 2] = 0;
        continue;
      }
      // Interiores opacos sem borda: quatro comparações, sem varrer vizinhança RGB.
      if (
        alpha === 255 &&
        x > 0 &&
        y > 0 &&
        x < removed.width - 1 &&
        y < removed.height - 1 &&
        mask[pixel - 1] === 255 &&
        mask[pixel + 1] === 255 &&
        mask[pixel - removed.width] === 255 &&
        mask[pixel + removed.width] === 255
      )
        continue;
      const neighbors = neighborhood(mask, x, y, removed.width, removed.height);
      if (!isEdge(alpha, neighbors.min, neighbors.max) && mode === "neutral")
        continue;
      const cleaned = cleanupAlpha(mask, x, y, removed.width, removed.height);
      let refined = cleaned
        ? refineEdgeAlpha(cleaned, neighbors, profile.smoothing, mode, radius)
        : mode === "expand"
          ? refineEdgeAlpha(0, neighbors, profile.smoothing, mode, radius)
          : 0;
      if (cleaned !== alpha) stats.cleaned++;
      if (original.channels === 4)
        refined = Math.min(refined, original.data[pixel * 4 + 3]);
      data[offset + 3] = refined;
      if (alpha === 0 && refined > 0) {
        for (let channel = 0; channel < 3; channel++)
          data[offset + channel] =
            original.data[pixel * original.channels + channel];
      }
      if (refined !== alpha) stats.alphaChanged++;
      if (!refined) {
        data[offset] = data[offset + 1] = data[offset + 2] = 0;
        continue;
      }
      const corrected = decontaminateEdge(
        original,
        mask,
        x,
        y,
        alpha,
        profile.decontamination,
        profile.maxColorShift,
      );
      if (corrected) {
        for (let channel = 0; channel < 3; channel++)
          data[offset + channel] = corrected[channel];
        stats.colorChanged++;
      }
    }
  return { data, width: removed.width, height: removed.height, stats };
}
