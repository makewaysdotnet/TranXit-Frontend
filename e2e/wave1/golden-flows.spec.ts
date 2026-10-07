import { test, expect } from "../fixtures/auth.fixture";
import {
  createCustomerJobForCourierBid,
  expectGatewayBid,
  expectGatewayJobStatus,
  gatewayLogin,
  readDevOtpCookie,
  seedCourierBid,
} from "../helpers/live-data";

test("T-E2E-COUR.PublicArtworkOptimizesWithoutCookies", async ({ request }) => {
  // Repository-owned artwork is public; application routes remain role-protected.
  const asset = "/courier/figma/dashboard/avatar.png";
  const original = await request.get(asset, { maxRedirects: 0 });
  expect(original.status()).toBe(200);
  expect(original.headers()["content-type"]).toContain("image/");
  const optimized = await request.get(`/_next/image?url=${encodeURIComponent(asset)}&w=64&q=75`);
  expect(optimized.status()).toBe(200);
  expect(optimized.headers()["content-type"]).toContain("image/");
});

test("T-E2E-CUST.GoldenFlow", async ({ page, request }) => {
  // UC-AUTH-1, UC-AUTH-2, UC-AUTH-3, UC-CUST-2, UC-CUST-4, UC-CUST-5
  const email = `e2e.customer.${Date.now()}@tranxit.local`;
  const password = "Password1!";

  await page.goto("/register");
  await page.getByLabel("Full name").fill("E2E Customer");
  await page.getByLabel("Phone").fill("+92 300 7770000");
  await page.getByLabel("Portal").selectOption("Customer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/verify-email$/);
  const otp = await readDevOtpCookie(page, email);
  await page.getByLabel("Verification code").fill(otp);
  await page.getByRole("button", { name: "Verify email" }).click();
  await expect(page).toHaveURL(/\/login\?verified=1$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/jobs/new");
  await expect(page.getByRole("button", { name: "Confirm & request bids" })).toBeEnabled();
  await page.getByLabel("Recipient email").fill(`recipient.${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Confirm & request bids" }).click();
  await expect(page).toHaveURL(/\/jobs\/\d+\/bids$/);

  const jobId = Number(page.url().match(/\/jobs\/(\d+)\/bids/)?.[1]);
  expect(jobId).toBeGreaterThan(0);
  await seedCourierBid(request, jobId);
  await page.reload();

  await expect(page.getByRole("button", { name: "Accept bid" })).toBeVisible();
  await expect(page.getByText("PKR 2,030,000.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Accept bid" }).click();
  await expect(page.getByRole("button", { name: "Bid accepted" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("PKR 2,030,000.00", { exact: true })).toBeVisible();
  await expectGatewayJobStatus(request, email, jobId, "Won");

  await page.goto("/dashboard");
  await expect(page.getByText("Won")).toBeVisible();
});

test("T-E2E-COUR.GoldenFlow", async ({ browser, baseURL, courierStorageState, request }) => {
  // UC-AUTH-3, UC-COUR-2, UC-COUR-4
  const job = await createCustomerJobForCourierBid(request);
  const context = await browser.newContext({ baseURL, storageState: courierStorageState });
  const page = await context.newPage();

  await page.goto("/courier/jobs");
  await expect(page.getByText("Browse requests and prepare bids")).toBeVisible();
  await expect(page.getByText(job.jobNumber)).toBeVisible();
  await page.locator(`a[href="/courier/jobs/${job.jobId}/bid"]`).click();
  await expect(page).toHaveURL(new RegExp(`/courier/jobs/${job.jobId}/bid$`));
  await expect(page.getByText(`Build proposal for ${job.jobNumber}`)).toBeVisible();
  await page.getByLabel("Ocean freight", { exact: true }).fill("1234.56");
  await page.getByLabel("Origin handling", { exact: true }).fill("7.89");
  await page.getByLabel("Customs clearance", { exact: true }).fill("0.10");
  await page.getByLabel("Pickup charges", { exact: true }).fill("0.20");
  await expect(page.getByRole("status", { name: "Proposal total" })).toHaveText("PKR 1,242.75");
  await page.getByRole("button", { name: "Submit bid" }).click();
  await expect(page).toHaveURL(new RegExp(`/courier/jobs/${job.jobId}$`));
  await expectGatewayBid(request, job.jobId, 1242.75);

  await context.close();
});

test("T-E2E-AUTH.RegisterAdminBlocked", async ({ page, request }) => {
  // UC-AUTH-6
  await page.goto("/register");
  const portal = page.getByLabel("Portal");
  await expect(portal).toContainText("Customer");
  await expect(portal).toContainText("Courier company");
  await expect(portal).not.toContainText("Admin");
  await expect(portal).not.toContainText("Agent");

  const response = await request.post("/api/auth/register", {
    data: {
      username: "Blocked Admin",
      email: `e2e.admin.${Date.now()}@tranxit.local`,
      phone: "+92 300 9990000",
      role: "Admin",
      roleId: 4,
      password: "Password1!",
      confirmPassword: "Password1!",
    },
  });

  expect(response.status()).toBe(400);
  const result = await response.json();
  expect(result.isSuccess).toBe(false);
});

test("T-E2E-AUTH.UnauthDashboardRedirect", async ({ page }) => {
  // UC-AUTH-7
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});

test("T-E2E-AUTH.CrossRoleRedirect", async ({
  browser,
  baseURL,
  customerStorageState,
  courierStorageState,
}) => {
  // UC-AUTH-7
  const customerContext = await browser.newContext({ baseURL, storageState: customerStorageState });
  const customerPage = await customerContext.newPage();
  await customerPage.goto("/courier/dashboard");
  await expect(customerPage).toHaveURL(/\/dashboard$/);
  await customerContext.close();

  const courierContext = await browser.newContext({ baseURL, storageState: courierStorageState });
  const courierPage = await courierContext.newPage();
  await courierPage.goto("/dashboard");
  await expect(courierPage).toHaveURL(/\/courier\/dashboard$/);
  await courierContext.close();
});

test("T-E2E-AUTH.BffTokenContainment", async ({ page }) => {
  // UC-AUTH-10
  await page.goto("/login");
  const loginResponse = await page.evaluate(async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@tranxit.local",
        password: "Password1!",
      }),
    });
    return { status: response.status, body: await response.json() };
  });
  expect(loginResponse.status).toBe(200);
  const loginResult = loginResponse.body;
  expect(loginResult.isSuccess).toBe(true);
  expect(loginResult.value).not.toHaveProperty("token");
  expect(loginResult.value).not.toHaveProperty("refreshToken");
  expect(loginResult.value).not.toHaveProperty("refreshTokenExpires");

  const refreshResponse = await page.evaluate(async () => {
    const response = await fetch("/api/auth/refresh", { method: "POST" });
    return { status: response.status, body: await response.json() };
  });
  expect(refreshResponse.status).toBe(200);
  const refreshResult = refreshResponse.body;
  expect(refreshResult.isSuccess).toBe(true);
  expect(refreshResult.value).not.toHaveProperty("token");
  expect(refreshResult.value).not.toHaveProperty("refreshToken");
  expect(refreshResult.value).not.toHaveProperty("refreshTokenExpires");

  const logoutStatus = await page.evaluate(async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    return response.status;
  });
  expect(logoutStatus).toBe(200);
  const postLogoutRefreshStatus = await page.evaluate(async () => {
    const response = await fetch("/api/auth/refresh", { method: "POST" });
    return response.status;
  });
  expect(postLogoutRefreshStatus).toBe(401);
});
