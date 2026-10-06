import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: { baseURL: process.env.DROPBG_TEST_URL ?? "http://localhost:3000", browserName: "chromium" },
  webServer: {
    command: process.env.DROPBG_TEST_URL ? "npm run start -- --port 3001" : "npm run dev",
    url: process.env.DROPBG_TEST_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
