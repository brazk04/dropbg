import type { PixelImage } from "./types";
export async function encodeRefinedPng(image: PixelImage): Promise<Blob> {
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(image.width, image.height)
      : typeof document !== "undefined"
        ? document.createElement("canvas")
        : null;
  if (!canvas) throw new Error("Canvas encoder unavailable; keep RAW.");
  try {
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!context) throw new Error("2D encoder unavailable.");
    // View do buffer existente, sem duplicar RGBA. ImageData usa straight alpha.
    const pixels = new Uint8ClampedArray(
      image.data.buffer as ArrayBuffer,
      image.data.byteOffset,
      image.data.byteLength,
    );
    context.putImageData(
      new ImageData(pixels, image.width, image.height),
      0,
      0,
    );
    if ("convertToBlob" in canvas)
      return await canvas.convertToBlob({ type: "image/png" });
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed.")),
        "image/png",
      ),
    );
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
