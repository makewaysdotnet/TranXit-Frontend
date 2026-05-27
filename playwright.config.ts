import { defineConfig, devices } from "@playwright/test";

const frontendPort = process.env.TRANXIT_E2E_FRONTEND_PORT || "3100";
const gatewayPort = process.env.TRANXIT_E2E_GATEWAY_PORT || "18188";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${frontendPort}`;
const apiURL =
  process.env.TRANXIT_API_URL ||
  process.env.NEXT_PUBLIC_TRANXIT_API_URL ||
  `http://127.0.0.1:${gatewayPort}`;
const mailInboxURL = process.env.TRANXIT_E2E_MAIL_INBOX || "";
const mailInboxUser = process.env.TRANXIT_E2E_MAIL_INBOX_USER || "";
const mailInboxPassword = process.env.TRANXIT_E2E_MAIL_INBOX_PASSWORD || "";

process.env.PLAYWRIGHT_BASE_URL = baseURL;
process.env.TRANXIT_API_URL = apiURL;
process.env.NEXT_PUBLIC_TRANXIT_API_URL = apiURL;
process.env.TRANXIT_E2E_MAIL_INBOX = mailInboxURL;
process.env.TRANXIT_E2E_MAIL_INBOX_USER = mailInboxUser;
process.env.TRANXIT_E2E_MAIL_INBOX_PASSWORD = mailInboxPassword;
process.env.TRANXIT_E2E_EXPOSE_DEV_CODE ||= "true";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node e2e/scripts/start-e2e.mjs",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PLAYWRIGHT_BASE_URL: baseURL,
      TRANXIT_API_URL: apiURL,
      NEXT_PUBLIC_TRANXIT_API_URL: apiURL,
      TRANXIT_E2E_MAIL_INBOX: mailInboxURL,
      TRANXIT_E2E_MAIL_INBOX_USER: mailInboxUser,
      TRANXIT_E2E_MAIL_INBOX_PASSWORD: mailInboxPassword,
      TRANXIT_E2E_EXPOSE_DEV_CODE: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
