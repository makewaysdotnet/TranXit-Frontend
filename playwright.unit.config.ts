import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/unit",
  workers: 1,
  retries: 0,
  reporter: "list",
});
