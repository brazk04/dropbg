import { expect, test } from "@playwright/test";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==",
  "base64",
);

test("seleção, preview local, aviso da fase e remoção", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") requests.push(request.url());
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "original.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(
    page.getByText("Imagem original", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByAltText("Preview da imagem original: original.png"),
  ).toHaveAttribute("src", /^blob:/);
  const picker = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Trocar imagem" }).click();
  await (
    await picker
  ).setFiles({ name: "nova.png", mimeType: "image/png", buffer: png });
  await expect(
    page.getByAltText("Preview da imagem original: nova.png"),
  ).toBeVisible();
  await expect(
    page.getByAltText("Preview da imagem original: original.png"),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".preview-actions")
      .getByRole("button", { name: "Remover fundo" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Remover imagem", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Selecionar imagem" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});

test("validação de extensão e imagem corrompida", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "arquivo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg />"),
  });
  await expect(page.getByText(/Formato não suportado/)).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "quebrada.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  });
  await expect(
    page.getByText(/Não foi possível abrir essa imagem/),
  ).toBeVisible();
});

test("drag and drop e clipboard", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    (bytes) => {
      const data = new DataTransfer();
      data.items.add(
        new File([new Uint8Array(bytes)], "arrastada.png", {
          type: "image/png",
        }),
      );
      document.querySelector(".upload-panel")!.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: data,
        }),
      );
    },
    [...png],
  );
  await expect(
    page.getByAltText("Preview da imagem original: arrastada.png"),
  ).toBeVisible();
  await page.evaluate(
    (bytes) => {
      const data = new DataTransfer();
      data.items.add(
        new File([new Uint8Array(bytes)], "colada.png", { type: "image/png" }),
      );
      document.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: data,
        }),
      );
    },
    [...png],
  );
  await expect(
    page.getByAltText("Preview da imagem original: colada.png"),
  ).toBeVisible();
  await expect(page.getByText("Imagem colada com sucesso.")).toBeVisible();
});

test("teclado, FAQ e navegação", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  await page
    .locator("summary")
    .filter({ hasText: "Minha imagem é enviada para algum servidor?" })
    .click();
  await expect(
    page
      .locator(".faq-list")
      .getByText(/a composição ficam no seu dispositivo/),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Privacidade", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Sua imagem fica com você." }),
  ).toBeVisible();
});

for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  test(`layout sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img[src*="showcase"]').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Selecionar imagem" }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    if ([320, 390, 768, 1440].includes(width)) {
      const dataUrl = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 420;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "#e7ebee";
        context.fillRect(0, 0, 640, 420);
        context.fillStyle = "#163b65";
        context.fillRect(230, 80, 180, 280);
        context.fillStyle = "#ffffff";
        context.fillRect(270, 170, 100, 80);
        return canvas.toDataURL("image/png").split(",")[1];
      });
      await page.locator('input[type="file"]').setInputFiles({
        name: "produto.png",
        mimeType: "image/png",
        buffer: Buffer.from(dataUrl, "base64"),
      });
      await expect(
        page.getByAltText("Preview da imagem original: produto.png"),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page
        .locator("#ferramenta")
        .screenshot({ path: `test-results/preview-${width}.png` });
    }
  });
}
