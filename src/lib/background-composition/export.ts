import type { BackgroundOption } from "./types";
import { coverRect } from "./types";

// Não importa o motor de IA. Todas as dimensões vêm do recorte, nunca do DOM.
export async function composePng(
  foreground: Blob,
  width: number,
  height: number,
  background: BackgroundOption,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  let cutout: ImageBitmap | null = null;
  let backdrop: ImageBitmap | null = null;
  try {
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponível.");
    cutout = await createImageBitmap(foreground);
    if (cutout.width !== width || cutout.height !== height)
      throw new Error("Dimensões inválidas.");
    if (background.type === "color") {
      context.fillStyle = background.value;
      context.fillRect(0, 0, width, height);
    } else if (background.type === "image") {
      backdrop = await createImageBitmap(background.file);
      const rect = coverRect(backdrop.width, backdrop.height, width, height);
      context.drawImage(backdrop, rect.x, rect.y, rect.width, rect.height);
    }
    context.drawImage(cutout, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(new Error("Não foi possível gerar o PNG.")),
        "image/png",
      ),
    );
    if (!blob.size) throw new Error("PNG vazio.");
    return blob;
  } finally {
    cutout?.close();
    backdrop?.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}
