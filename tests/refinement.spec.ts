import { expect, test } from "@playwright/test";
import {
  clampAlpha,
  extractAlpha,
  isEdge,
  neighborhood,
} from "../src/lib/background-removal/refinement/alpha-mask";
import { cleanupAlpha } from "../src/lib/background-removal/refinement/cleanup";
import {
  refineEdgeAlpha,
  resolutionRadius,
} from "../src/lib/background-removal/refinement/edge-refinement";
import { refineBackgroundRemoval } from "../src/lib/background-removal/refinement/refine-result";
import {
  REFINEMENT_PROFILES,
  type PixelImage,
} from "../src/lib/background-removal/refinement/types";
import {
  coverRect,
  normalizeHex,
} from "../src/lib/background-composition/types";

function image(
  width: number,
  height: number,
  fill: (x: number, y: number) => number[],
): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) data.set(fill(x, y), (y * width + x) * 4);
  return { data, width, height, channels: 4 };
}

test("alpha: clamp, extração e borda sem binarização", () => {
  expect([-1, 0, 127.6, 255, 300, NaN].map(clampAlpha)).toEqual([
    0, 0, 128, 255, 255, 0,
  ]);
  expect([
    ...extractAlpha(image(3, 1, (x) => [10, 20, 30, [0, 128, 255][x]])),
  ]).toEqual([0, 128, 255]);
  expect(isEdge(128, 128, 128)).toBe(true);
  expect(isEdge(255, 255, 255)).toBe(false);
  expect(isEdge(255, 0, 255)).toBe(true);
});
test("cleanup conserva fios conectados e pontos fortes", () => {
  const mask = new Uint8Array(25);
  mask[12] = 8;
  expect(cleanupAlpha(mask, 2, 2, 5, 5)).toBe(0);
  mask[13] = 8;
  expect(cleanupAlpha(mask, 2, 2, 5, 5)).toBe(8);
  mask[13] = 0;
  mask[12] = 200;
  expect(cleanupAlpha(mask, 2, 2, 5, 5)).toBe(200);
});
test("smoothing reduz degrau, sem cortar alpha intermediário ou fio opaco", () => {
  const neighbors = { min: 0, max: 255, mean: 100, support: 3 };
  expect(refineEdgeAlpha(150, neighbors, 0.12, "neutral", 1)).toBe(144);
  expect(refineEdgeAlpha(1, neighbors, 0.12, "neutral", 1)).toBeGreaterThan(0);
  expect(refineEdgeAlpha(254, neighbors, 0.12, "neutral", 1)).toBeLessThan(255);
  expect(refineEdgeAlpha(255, neighbors, 0.12, "neutral", 1)).toBe(255);
  expect(refineEdgeAlpha(0, neighbors, 0.12, "neutral", 1)).toBe(0);
});
test("contração/expansão é opcional e escala com a resolução", () => {
  expect(resolutionRadius(100, 100)).toBe(0.05);
  expect(resolutionRadius(4000, 3000)).toBe(2);
  const neighbors = { min: 0, max: 255, mean: 128, support: 5 };
  expect(refineEdgeAlpha(128, neighbors, 0, "contract", 2)).toBeLessThan(128);
  expect(refineEdgeAlpha(128, neighbors, 0, "expand", 2)).toBeGreaterThan(128);
  expect(refineEdgeAlpha(128, neighbors, 0, "neutral", 2)).toBe(128);
});
test("RGB interno e translucidez uniforme ficam intactos; RAW não é mutado", () => {
  const original = image(9, 9, () => [80, 120, 160, 255]);
  const raw = image(9, 9, () => [80, 120, 160, 128]);
  const copy = raw.data.slice();
  const refined = refineBackgroundRemoval(original, raw);
  expect(refined.data).toEqual(copy);
  expect(raw.data).toEqual(copy);
  const solid = image(9, 9, () => [80, 120, 160, 255]);
  expect(refineBackgroundRemoval(original, solid).data).toEqual(solid.data);
});
test("decontaminação reduz halo branco conhecido, com correção RGB limitada", () => {
  const original = image(7, 5, (x) => {
    const rgb = x < 2 ? 250 : x < 4 ? 150 : 50;
    return [rgb, rgb, rgb, 255];
  });
  const raw = image(7, 5, (x) => {
    const rgb = x < 2 ? 250 : x < 4 ? 150 : 50;
    return [rgb, rgb, rgb, x < 2 ? 0 : x < 4 ? 128 : 255];
  });
  const refined = refineBackgroundRemoval(original, raw);
  const offset = (2 * 7 + 3) * 4;
  expect(refined.data[offset]).toBeLessThan(150);
  expect(refined.data[offset]).toBeGreaterThanOrEqual(138);
  expect(refined.data[offset + 3]).toBeGreaterThan(0);
  expect(refined.data[offset + 3]).toBeLessThan(255);
  expect(refined.data[(2 * 7 + 5) * 4]).toBe(50);
  expect(refined.stats.colorChanged).toBeGreaterThan(0);
});
test("cor sem âncoras confiáveis é preservada", () => {
  const original = image(5, 5, () => [240, 30, 80, 255]);
  const raw = image(5, 5, () => [240, 30, 80, 120]);
  expect(refineBackgroundRemoval(original, raw).stats.colorChanged).toBe(0);
});
test("alpha preexistente limita refinamento e zeros não deixam RGB residual", () => {
  const original = image(5, 5, () => [90, 120, 150, 64]);
  const raw = image(5, 5, (x) => [90, 120, 150, x === 0 ? 0 : 64]);
  const refined = refineBackgroundRemoval(original, raw);
  for (let i = 3; i < refined.data.length; i += 4)
    expect(refined.data[i]).toBeLessThanOrEqual(64);
  expect([...refined.data.slice(0, 4)]).toEqual([0, 0, 0, 0]);
});
test("dimensões, modo in-place e perfis conservadores", () => {
  const source = image(100, 60, () => [50, 60, 70, 255]);
  const raw = image(100, 60, (x, y) => [
    50,
    60,
    70,
    x > 20 && y > 10 ? 255 : 0,
  ]);
  const refined = refineBackgroundRemoval(source, raw, { inPlace: true });
  expect(refined.data).toBe(raw.data);
  expect([refined.width, refined.height]).toEqual([100, 60]);
  expect(() =>
    refineBackgroundRemoval(
      image(1, 1, () => [0, 0, 0, 255]),
      raw,
    ),
  ).toThrow();
  expect(REFINEMENT_PROFILES.balanced.smoothing).toBeLessThan(0.2);
  expect(neighborhood(new Uint8Array([0, 255, 128, 64]), 0, 0, 2, 2).mean).toBe(
    111.75,
  );
});
test("composição cover e HEX continuam corretos", () => {
  expect(coverRect(1200, 400, 800, 600)).toEqual({
    x: -500,
    y: 0,
    width: 1800,
    height: 600,
  });
  expect(normalizeHex("#abc")).toBe("#AABBCC");
  expect(normalizeHex("#wrong")).toBeNull();
});
