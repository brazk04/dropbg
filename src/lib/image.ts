import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_EDGE,
} from "./constants";
import type { LocalImage } from "@/types/image";

export function validateImage(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !ACCEPTED_EXTENSIONS.includes(extension) ||
    (file.type && !ACCEPTED_MIME_TYPES.includes(file.type))
  ) {
    return "Formato não suportado. Escolha uma imagem PNG, JPG, JPEG ou WEBP.";
  }
  if (!file.size) return "A imagem está vazia. Escolha outro arquivo.";
  if (file.size > MAX_FILE_SIZE) return "A imagem deve ter no máximo 25 MB.";
  return null;
}

export function validateDimensions(
  width: number,
  height: number,
): string | null {
  if (!width || !height) return "A imagem possui dimensões inválidas.";
  if (
    width * height > MAX_IMAGE_PIXELS ||
    Math.max(width, height) > MAX_IMAGE_EDGE
  )
    return "A imagem é muito grande para processamento local. Use até 16 megapixels e no máximo 8192 pixels por lado; não reduzimos sua imagem automaticamente.";
  return null;
}

export async function loadLocalImage(file: File): Promise<LocalImage> {
  const error = validateImage(file);
  if (error) throw new Error(error);
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = [82, 73, 70, 70].every((byte, i) => bytes[i] === byte) &&
    [87, 69, 66, 80].every((byte, i) => bytes[i + 8] === byte);
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!(png && extension === "png") && !(jpeg && ["jpg", "jpeg"].includes(extension ?? "")) && !(webp && extension === "webp")) {
    throw new Error("Não foi possível abrir essa imagem. O conteúdo não corresponde ao formato PNG, JPG, JPEG ou WEBP informado.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const invalid = validateDimensions(image.naturalWidth, image.naturalHeight);
    if (invalid) throw new Error(invalid);
    return {
      file,
      url,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.includes("processamento local"))
      throw error;
    throw new Error(
      "Não foi possível abrir essa imagem. Verifique o arquivo e tente novamente.",
    );
  }
}

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
