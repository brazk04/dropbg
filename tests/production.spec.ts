import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("SEO, páginas públicas, manifest e 404", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("DropBG — Remova o fundo de imagens grátis");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /processamento no seu dispositivo/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pt_BR");
  for (const route of ["/privacidade", "/termos", "/sobre-o-projeto", "/icon.svg", "/opengraph-image", "/sitemap.xml"]) {
    expect((await request.get(route)).status()).toBe(200);
  }
  const robots = await request.get("/robots.txt");
  for (const [source, destination] of [["/privacy", "/privacidade"], ["/terms", "/termos"]]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
  expect(await robots.text()).toContain("Allow: /");
  const manifest = await request.get("/manifest.webmanifest");
  expect(await manifest.json()).toMatchObject({ name: "DropBG", short_name: "DropBG", theme_color: "#163b65" });
  const missing = await page.goto("/pagina-inexistente");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para o DropBG" }).click();
  await expect(page.getByRole("button", { name: "Selecionar imagem" })).toBeVisible();
});

test("conteúdo real do arquivo, formatos e limites", async ({ page }) => {
  await page.goto("/");
  const input = page.locator('input[type="file"]');
  const validPng = await sharp({ create: { width: 32, height: 24, channels: 3, background: "white" } }).png().toBuffer();
  await input.setInputFiles({ name: "falso.jpg", mimeType: "image/jpeg", buffer: validPng });
  await expect(page.locator(".toast-error")).toContainText("conteúdo não corresponde");
  await input.setInputFiles({ name: "grande.png", mimeType: "image/png", buffer: Buffer.alloc(26 * 1024 * 1024) });
  await expect(page.locator(".toast-error")).toContainText("25 MB");
  const enormous = await sharp({ create: { width: 8200, height: 1, channels: 3, background: "white" } }).png().toBuffer();
  await input.setInputFiles({ name: "dimensoes.png", mimeType: "image/png", buffer: enormous });
  await expect(page.locator(".toast-error")).toContainText("8192 pixels");
  for (const [name, mimeType, buffer] of [
    ["imagem.png", "image/png", validPng],
    ["imagem.jpg", "image/jpeg", await sharp(validPng).jpeg().toBuffer()],
    ["imagem.jpeg", "image/jpeg", await sharp(validPng).jpeg().toBuffer()],
    ["imagem.webp", "image/webp", await sharp(validPng).webp().toBuffer()],
  ] as const) {
    await input.setInputFiles({ name, mimeType, buffer });
    await expect(page.getByAltText(`Preview da imagem original: ${name}`)).toBeVisible();
    await page.getByRole("button", { name: "Remover imagem" }).click();
  }
});
