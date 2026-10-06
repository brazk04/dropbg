import { expect, test } from "@playwright/test";

test("fotografias locais otimizadas, acessíveis e sem alterações de layout", async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/unsplash|pexels/.test(request.url())) external.push(request.url());
  });
  await page.goto("/");
  const images = page.locator('img[src*="showcase"]');
  await expect(images).toHaveCount(8);
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("srcset", /\/_next\/image/);
    await expect(image).toHaveAttribute("alt");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await image.evaluate((node) => {
      const img = node as HTMLImageElement;
      return Math.abs(img.naturalWidth / img.naturalHeight - img.width / img.height);
    })).toBeLessThan(0.02);
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
