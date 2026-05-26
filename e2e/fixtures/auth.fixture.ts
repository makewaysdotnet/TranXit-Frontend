import fs from "node:fs/promises";
import path from "node:path";
import { expect, test as base, type Browser } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";

type AuthFixtures = {
  customerStorageState: string;
  courierStorageState: string;
};

const accounts = {
  customer: {
    email: "customer@tranxit.local",
    password: "Password1!",
    landingPath: "/dashboard",
  },
  courier: {
    email: "courier@tranxit.local",
    password: "Password1!",
    landingPath: "/courier/dashboard",
  },
};

export const test = base.extend<{}, AuthFixtures>({
  customerStorageState: [
    async ({ browser }, use, workerInfo) => {
      const statePath = path.join(workerInfo.project.outputDir, ".auth", "customer.json");
      await createStorageState(browser, baseUrl, statePath, accounts.customer);
      await use(statePath);
    },
    { scope: "worker" },
  ],
  courierStorageState: [
    async ({ browser }, use, workerInfo) => {
      const statePath = path.join(workerInfo.project.outputDir, ".auth", "courier.json");
      await createStorageState(browser, baseUrl, statePath, accounts.courier);
      await use(statePath);
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";

async function createStorageState(
  browser: Browser,
  baseURL: string,
  statePath: string,
  account: { email: string; password: string; landingPath: string },
) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${account.landingPath.replace("/", "\\/")}$`));
  await context.storageState({ path: statePath });
  await context.close();
}
