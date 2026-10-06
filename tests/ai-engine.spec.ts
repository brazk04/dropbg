import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
test.use({
  launchOptions: {
    args:
      process.env.DROPBG_WEBGPU_TEST === "1"
        ? ["--enable-unsafe-webgpu"]
        : ["--disable-webgpu"],
  },
});

// Teste opt-in: inferência real, downloads de modelo/runtime e várias imagens.
test("motor real: alpha, resolução, download, cache e privacidade", async ({
  page,
}) => {
  test.skip(
    process.env.DROPBG_AI_TEST !== "1",
    "Defina DROPBG_AI_TEST=1 e coloque as imagens de teste em .validation/.",
  );
  test.setTimeout(10 * 60 * 1000);
  const inputs = [
    "pessoa.jpg",
    "animal.jpg",
    "produto.png",
    "objeto.webp",
    "pequena.png",
    "grande.jpg",
    "pessoa-branca.jpg",
    "produto-branco.png",
    "produto-preto.png",
  ];
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const instrumented = window as Window & { inferenceRequests?: number };
    instrumented.inferenceRequests = 0;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown) {
        instrumented.inferenceRequests!++;
        super.postMessage(message);
      }
    };
    const revoke = URL.revokeObjectURL.bind(URL);
    const list: string[] = [];
    (window as Window & { revokedURLs?: string[] }).revokedURLs = list;
    URL.revokeObjectURL = (url) => {
      list.push(url);
      revoke(url);
    };
  });
  if (process.env.DROPBG_SIMULATE_GPU_FAILURE === "1") {
    // Simula uma falha do backend GPU no protocolo; o fallback executa IA WASM real.
    await page.addInitScript(() => {
      const NativeWorker = window.Worker;
      let failed = false;
      window.Worker = class extends NativeWorker {
        postMessage(message: { id: number; file: Blob; forceWasm?: boolean }) {
          if (!failed && !message.forceWasm) {
            failed = true;
            queueMicrotask(() =>
              this.dispatchEvent(
                new MessageEvent("message", {
                  data: { id: message.id, type: "fallback-wasm" },
                }),
              ),
            );
          } else super.postMessage(message);
        }
      };
    });
  }
  for (const input of inputs)
    expect(existsSync(`.validation/${input}`)).toBe(true);
  const external: { url: string; method: string; hasBody: boolean }[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.text().startsWith("DropBG timings") ||
      message.text().startsWith("DropBG refinement")
    )
      console.log(message.text());
    if (message.type() === "error") console.log("Browser:", message.text());
  });
  page.on("request", (request) => {
    if (
      request.url().startsWith("http") &&
      !request.url().startsWith("http://localhost")
    )
      external.push({
        url: request.url(),
        method: request.method(),
        hasBody: request.postDataBuffer() !== null,
      });
  });
  page.on("worker", (worker) => {
    void worker.evaluate(() => {
      const original = self.postMessage.bind(self);
      self.postMessage = ((message: {
        type?: string;
        result?: { device: string; width: number; height: number };
        update?: unknown;
      }) => {
        if (message.type === "result")
          console.log(
            "DROPBG_REAL_RESULT",
            JSON.stringify({
              device: message.result?.device,
              width: message.result?.width,
              height: message.result?.height,
            }),
          );
        original(message);
      }) as typeof self.postMessage;
    });
  });
  await page.goto("/");
  console.log(
    "WEBGPU DISPONÍVEL:",
    await page.evaluate(async () => {
      const gpu = (
        navigator as Navigator & {
          gpu?: { requestAdapter(): Promise<unknown> };
        }
      ).gpu;
      return !!gpu && !!(await gpu.requestAdapter());
    }),
  );
  await page.waitForTimeout(500);
  expect(external).toEqual([]); // Nada de modelo/runtime antes de clicar.
  let firstDownloads = 0;
  for (const [index, input] of inputs.entries()) {
    await page
      .locator('input[type="file"]')
      .setInputFiles(`.validation/${input}`);
    await expect(
      page.getByAltText(`Preview da imagem original: ${input}`),
    ).toBeVisible();
    const original = await page
      .locator(".local-preview")
      .evaluate((element: HTMLImageElement) => ({
        width: element.naturalWidth,
        height: element.naturalHeight,
      }));
    await page
      .locator(".preview-actions")
      .getByRole("button", { name: "Remover fundo" })
      .click();
    await expect(
      page.getByRole("button", { name: "Remover imagem" }),
    ).toBeDisabled();
    await expect(
      page.getByAltText("Resultado com fundo transparente"),
    ).toBeVisible({ timeout: 300000 });
    const image = page.getByAltText("Resultado com fundo transparente");
    const pixels = await image.evaluate((element: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
      const context = canvas.getContext("2d")!;
      context.drawImage(element, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0,
        opaque = 0,
        soft = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 10) clear++;
        if (data[i] > 245) opaque++;
        if (data[i] > 10 && data[i] < 245) soft++;
      }
      return {
        width: canvas.width,
        height: canvas.height,
        clear,
        opaque,
        soft,
      };
    });
    expect({ width: pixels.width, height: pixels.height }).toEqual(original);
    expect(pixels.clear).toBeGreaterThan(0);
    expect(pixels.opaque).toBeGreaterThan(0);
    const toggle = page.getByRole("checkbox", { name: /Refinar bordas/ });
    await expect(toggle).toBeChecked();
    const refinedUrl = await image.getAttribute("src");
    const jobsBeforeToggle = await page.evaluate(
      () =>
        (window as Window & { inferenceRequests?: number }).inferenceRequests,
    );
    await toggle.uncheck();
    const rawUrl = await image.getAttribute("src");
    expect(rawUrl).not.toBe(refinedUrl);
    const rawDownloadEvent = page.waitForEvent("download");
    await page.getByRole("link", { name: "Baixar PNG" }).click();
    const rawDownload = await rawDownloadEvent;
    await rawDownload.saveAs(`.validation/results/raw-${index}.png`);
    await toggle.check();
    await expect(image).toHaveAttribute("src", refinedUrl!);
    expect(
      await page.evaluate(
        () =>
          (window as Window & { inferenceRequests?: number }).inferenceRequests,
      ),
    ).toBe(jobsBeforeToggle);
    if (!index || input === "grande.jpg") {
      const requestsBefore = await page.evaluate(
        () =>
          (window as Window & { inferenceRequests?: number }).inferenceRequests,
      );
      const downloadComposition = async (label: string) => {
        const event = page.waitForEvent("download");
        await page.getByRole("link", { name: "Baixar PNG" }).click();
        const file = await event;
        const path = `.validation/results/composicao-${index}-${label}.png`;
        await file.saveAs(path);
        const { data, info } = await sharp(readFileSync(path))
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        expect({ width: info.width, height: info.height }).toEqual(original);
        return [...data.subarray(0, 4)];
      };
      for (const [label, expected] of [
        ["Branco", [255, 255, 255, 255]],
        ["Preto", [0, 0, 0, 255]],
        ["Cinza claro", [241, 245, 249, 255]],
        ["Azul DropBG", [22, 59, 101, 255]],
      ] as const) {
        await page.getByRole("button", { name: label, exact: true }).click();
        await expect(
          page.getByRole("button", { name: label, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        expect(await downloadComposition(label)).toEqual([...expected]);
        await expect(page.locator(".comparison-canvas")).toHaveCSS(
          "background-image",
          "none",
        );
      }
      await page
        .getByRole("button", { name: "+ Cor personalizada", exact: true })
        .click();
      const hex = page.getByRole("textbox", { name: "Cor hexadecimal" });
      for (const color of ["#FFEEAA", "#102030", "#12ABEF"])
        await hex.fill(color);
      expect(await downloadComposition("cor")).toEqual([18, 171, 239, 255]);
      await hex.fill("#XYZ");
      await expect(hex).toHaveAttribute("aria-invalid", "true");
      expect(await downloadComposition("hex-invalido")).toEqual([
        18, 171, 239, 255,
      ]);
      const backgroundInput = page.getByLabel("Selecionar imagem de fundo", {
        exact: true,
      });
      let previousBackground: string | null = null;
      for (const shape of ["landscape", "portrait", "square"]) {
        await backgroundInput.setInputFiles(`.validation/fundo-${shape}.png`);
        await expect(
          page.locator('[data-background-type="image"]'),
        ).toBeVisible();
        const backgroundUrl = await page
          .locator(".composition-background")
          .getAttribute("src");
        if (previousBackground)
          expect(
            await page.evaluate(
              () => (window as Window & { revokedURLs?: string[] }).revokedURLs,
            ),
          ).toContain(previousBackground);
        previousBackground = backgroundUrl;
        const corner = await downloadComposition(shape);
        await page
          .getByRole("button", { name: "Resultado", exact: true })
          .click();
        const preview = await page.locator(".composition-frame").screenshot();
        const sampled = await sharp(preview)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        const offset = (5 * sampled.info.width + 5) * 4;
        expect([...sampled.data.subarray(offset, offset + 4)]).toEqual(corner);
        await page
          .getByRole("button", { name: "Comparar", exact: true })
          .click();
      }
      await backgroundInput.setInputFiles({
        name: "falso.png",
        mimeType: "image/png",
        buffer: Buffer.from("corrompida"),
      });
      await expect(page.locator(".composition-error")).toBeVisible();
      await page
        .getByRole("button", { name: "Remover fundo personalizado" })
        .click();
      await expect(
        page.getByRole("button", { name: "Transparente", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(await downloadComposition("transparente")).toEqual([0, 0, 0, 0]);
      expect(
        await page.evaluate(
          () =>
            (window as Window & { inferenceRequests?: number })
              .inferenceRequests,
        ),
      ).toBe(requestsBefore);
    }
    const slider = page.getByRole("slider", {
      name: "Comparar original e imagem sem fundo",
    });
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
    if (!index) {
      await slider.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(slider).toHaveAttribute("aria-valuenow", "45");
      await page.keyboard.press("Home");
      await expect(slider).toHaveAttribute("aria-valuenow", "0");
      await page.keyboard.press("End");
      await expect(slider).toHaveAttribute("aria-valuenow", "100");
      await page.locator(".comparison-canvas").scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const top = document
          .querySelector(".comparison-canvas")!
          .getBoundingClientRect().top;
        window.scrollBy(0, top - 120);
      });
      const bounds = (await page.locator(".comparison-canvas").boundingBox())!;
      await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        bounds.x + bounds.width * 0.75,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.up();
      await expect(slider).toHaveAttribute("aria-valuenow", "75");
      await page
        .getByRole("button", { name: "Resultado", exact: true })
        .click();
      await expect(slider).toHaveCount(0);
      await expect(
        page.getByAltText("Imagem original para comparação"),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Original", exact: true }).click();
      await expect(image).toHaveCount(0);
      await page.getByRole("button", { name: "Comparar", exact: true }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator(".comparison-canvas").scrollIntoViewIfNeeded();
      const touchBounds = (await page
        .locator(".comparison-canvas")
        .boundingBox())!;
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
      const point = (fraction: number) => [
        {
          x: touchBounds.x + touchBounds.width * fraction,
          y: touchBounds.y + touchBounds.height / 2,
        },
      ];
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: point(0.25),
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: point(0.7),
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await expect(slider).toHaveAttribute("aria-valuenow", "70");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .locator("#ferramenta")
        .screenshot({ path: ".validation/results/comparador-touch.png" });
      await cdp.detach();
      for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const layers = await page
          .locator(".comparison-image")
          .evaluateAll((elements) =>
            elements.map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              };
            }),
          );
        expect(layers[0]).toEqual(layers[1]);
        await page
          .locator("#ferramenta")
          .screenshot({ path: `.validation/results/comparador-${width}.png` });
      }
      await page.setViewportSize({ width: 1280, height: 720 });
    }
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("link", { name: "Baixar PNG" }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe(
      `${input.replace(/\.[^.]+$/, "")}-dropbg.png`,
    );
    await download.saveAs(
      `.validation/results/${download.suggestedFilename()}`,
    );
    await page
      .locator("#ferramenta")
      .screenshot({ path: `.validation/results/resultado-${index}.png` });
    expect(
      readFileSync(
        `.validation/results/${download.suggestedFilename()}`,
      ).subarray(0, 8),
    ).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    console.log(
      "VALIDAÇÃO REAL:",
      input,
      pixels,
      "device:",
      await page
        .locator("[data-processing-device]")
        .getAttribute("data-processing-device"),
    );
    const weights = external.filter((request) =>
      /\.onnx(?:\?|$)/.test(request.url),
    ).length;
    if (!index) firstDownloads = weights;
    else expect(weights).toBe(firstDownloads);
    const urls = await page
      .locator(".comparison-image")
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLImageElement).src),
      );
    await page
      .getByRole("button", { name: "Nova imagem", exact: true })
      .click();
    await expect(page.getByRole("slider")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Baixar PNG" })).toHaveCount(0);
    const revoked = await page.evaluate(
      () => (window as Window & { revokedURLs?: string[] }).revokedURLs,
    );
    for (const url of [...urls, rawUrl]) expect(revoked).toContain(url);
  }
  expect(errors).toEqual([]);
  expect(
    external.every(
      (request) => ["GET", "HEAD"].includes(request.method) && !request.hasBody,
    ),
  ).toBe(true);
  console.log(
    "REDE EXTERNA:",
    JSON.stringify(
      external.map((request) => ({
        ...request,
        url: new URL(request.url).origin + new URL(request.url).pathname,
      })),
    ),
  );
});

test("refinamento com falha preserva resultado bruto e download", async ({
  page,
}) => {
  test.skip(process.env.DROPBG_AI_TEST !== "1", "Inferência real opt-in.");
  test.setTimeout(300000);
  page.on("worker", (worker) => {
    void worker.evaluate(() => {
      const encode = OffscreenCanvas.prototype.convertToBlob;
      let calls = 0;
      OffscreenCanvas.prototype.convertToBlob = function (options) {
        if (++calls === 2)
          return Promise.reject(
            new Error("Simulated refinement encoding failure"),
          );
        return encode.call(this, options);
      };
    });
  });
  await page.goto("/");
  await page
    .locator('input[type="file"]')
    .setInputFiles(".validation/produto.png");
  await page
    .getByRole("button", { name: "Remover fundo", exact: true })
    .click();
  await expect(
    page.getByAltText("Resultado com fundo transparente"),
  ).toBeVisible({ timeout: 240000 });
  const toggle = page.getByRole("checkbox", { name: /Refinar bordas/ });
  await expect(toggle).toBeDisabled();
  await expect(toggle).not.toBeChecked();
  await expect(page.locator(".processing-error")).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Baixar PNG" }).click();
  const file = await download;
  await file.saveAs(".validation/results/fallback-bruto.png");
  const metadata = await sharp(
    ".validation/results/fallback-bruto.png",
  ).metadata();
  expect([metadata.width, metadata.height, metadata.hasAlpha]).toEqual([
    800,
    600,
    true,
  ]);
});

test("falha de download oferece nova tentativa e preserva original", async ({
  page,
}) => {
  await page.route("https://huggingface.co/**", (route) => route.abort());
  await page.goto("/");
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "teste.png",
    mimeType: "image/png",
    buffer: Buffer.from(dataUrl, "base64"),
  });
  await page
    .locator(".preview-actions")
    .getByRole("button", { name: "Remover fundo" })
    .click();
  await expect(page.locator(".processing-error")).toContainText(
    "Confira sua conexão",
    {
      timeout: 60000,
    },
  );
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toBeEnabled();
  await expect(
    page.getByAltText("Preview da imagem original: teste.png"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remover imagem" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".processing-error")).toContainText(
    "Confira sua conexão",
    { timeout: 60000 },
  );
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toBeEnabled();
});
