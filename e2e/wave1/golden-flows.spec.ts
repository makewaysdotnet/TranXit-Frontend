import { test, expect } from "../fixtures/auth.fixture";
import {
  createCustomerJobForCourierBid,
  expectGatewayBid,
  expectGatewayJobStatus,
  gatewayLogin,
  readDevOtpCookie,
  seedCourierBid,
} from "../helpers/live-data";

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
  const otp = await readDevOtpCookie(page);
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
  await page.getByRole("button", { name: "Accept bid" }).click();
  await expect(page.getByRole("button", { name: "Bid accepted" })).toBeVisible();
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
  await page.getByRole("button", { name: "Submit bid" }).click();
  await expect(page).toHaveURL(new RegExp(`/courier/jobs/${job.jobId}$`));
  await expectGatewayBid(request, job.jobId);

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
