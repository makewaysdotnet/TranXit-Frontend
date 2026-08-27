import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { frontendRoot, hosts, loadRuntime, runtimePaths } from "./e2e/scripts/edge-env.cjs";

if (process.env.TRANXIT_EDGE_E2E !== "1") {
  throw new Error("Use npm run e2e:edge:test; this configuration must not target an arbitrary origin.");
}
const runtime = process.env.TRANXIT_EDGE_PROJECT ? loadRuntime() : undefined;

export default defineConfig({
  testDir: "./e2e/edge",
  testMatch: "**/browser-boundary.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  outputDir: runtime ? runtimePaths(runtime).results : path.join(frontendRoot, "test-results/edge-discovery"),
  // Browser traces, videos and failure DOM snapshots can contain OTPs/cookies.
  // The wrapper preserves redacted command/service logs outside the test output.
  preserveOutput: "never",
  use: {
    trace: "off", video: "off", screenshot: "off",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    launchOptions: {
      args: [`--host-resolver-rules=${Object.values(hosts).map((host) => `MAP ${host} 127.0.0.1`).join(", ")}`],
    },
  },
  // No webServer and no Development fixtures: only the separately started edge stack.
  projects: [
    { name: "edge-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "edge-tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 }, hasTouch: true } },
    { name: "edge-mobile", use: { ...devices["Pixel 7"] } },
  ],
});
