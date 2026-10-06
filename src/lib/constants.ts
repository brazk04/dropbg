export const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
export const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const IMAGE_ACCEPT =
  ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 16_000_000;
export const MAX_IMAGE_EDGE = 8192;
// Configure o endereço real do repositório quando ele for publicado.
export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/brazk04/dropbg";
