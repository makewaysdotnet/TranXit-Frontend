import { randomBytes } from "node:crypto";
import { expect, type Page, type Response } from "@playwright/test";

export type BrowserResult = { status: number; body: unknown; tokenText: boolean };
export type PublicIdentity = { id: number; name: string; email: string; role: string; isEmailVerified: boolean };
export type Actor = { page: Page; email: string; password: string; name: string; role: "Customer" | "Courier" };
type Option = { id: number; name: string };
type Lookups = Record<"countries" | "cargoModes" | "courierModes" | "itemTypes" | "deliveryTypes", Option[]>;

export function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function forbiddenFields(value: unknown, parent = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => forbiddenFields(item, `${parent}[${index}]`));
  return Object.entries(object(value)).flatMap(([key, child]) => {
    const field = parent ? `${parent}.${key}` : key;
    return /^(?:token|access_?token.*|refresh_?token.*|development_?verification_?code|password|secret)$/i.test(key)
      ? [field] : forbiddenFields(child, field);
  });
}

export function expectNoTokens(result: BrowserResult) {
  // Assert only field names/booleans; a regression must not print the leaked value.
  expect(forbiddenFields(result.body), "Browser JSON must contain no token or development-OTP fields").toEqual([]);
  expect(result.tokenText, "Browser response must contain no serialized credentials").toBe(false);
}

export function successValue<T>(result: BrowserResult, status = 200): T {
  expectNoTokens(result);
  expect(result.status).toBe(status);
  expect(object(result.body).isSuccess).toBe(true);
  return object(result.body).value as T;
}

export function publicIdentity(result: BrowserResult) {
  const identity = successValue<PublicIdentity>(result);
  const fields = ["id", "name", "email", "role", "roleId", "isEmailVerified"];
  expect(Object.keys(object(identity)).filter((field) => !fields.includes(field)), "Authentication bodies project identity only").toEqual([]);
  return identity;
}

export function expectDenied(result: BrowserResult, status: number) {
  expectNoTokens(result);
  expect(result.status).toBe(status);
  expect(object(result.body).isSuccess === true).toBe(false);
}

async function readResponse(response: Response): Promise<BrowserResult> {
  const text = await response.text();
  let body: unknown = null;
  try { body = JSON.parse(text); } catch { /* Non-JSON errors are checked by status. */ }
  return {
    status: response.status(), body,
    tokenText: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|\b\d+\.[A-Za-z0-9_-]{32,}\b/.test(text),
  };
}

export async function browserJson(
  page: Page,
  pathname: string,
  options: { method?: "GET" | "POST" | "PUT"; body?: unknown; headers?: Record<string, string> } = {},
): Promise<BrowserResult> {
  expect(pathname.startsWith("/") && !pathname.startsWith("//"), "Use same-origin browser requests").toBe(true);
  expect(Object.keys(options.headers ?? {}).some((key) => /^(authorization|cookie)$/i.test(key)), "The fixture must not inject browser auth headers").toBe(false);
  return page.evaluate(async ({ pathname, options }) => {
    const response = await fetch(pathname, {
      method: options.method ?? "GET", credentials: "same-origin", cache: "no-store",
      headers: { ...(options.body === undefined ? {} : { "Content-Type": "application/json" }), ...options.headers },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
    const text = await response.text();
    let body: unknown = null;
    try { body = JSON.parse(text); } catch { /* Closed admission and 404 may be text. */ }
    return {
      status: response.status, body,
      tokenText: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|\b\d+\.[A-Za-z0-9_-]{32,}\b/.test(text),
    };
  }, { pathname, options });
}

export async function roundTrip(page: Page, pathname: string, method: string, action: () => Promise<unknown>) {
  const [response] = await Promise.all([
    page.waitForResponse((response) => new URL(response.url()).pathname === pathname && response.request().method() === method),
    action(),
  ]);
  return { response: await readResponse(response), request: response.request() };
}

export async function expectNoDevelopmentCookies(page: Page) {
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => /dev.*code|verification.*code/i.test(cookie.name)), "Production must not expose an OTP cookie").toBe(false);
}

export async function expectSecureSession(page: Page) {
  await expectNoDevelopmentCookies(page);
  const cookies = await page.context().cookies();
  for (const name of ["tranxit_session", "tranxit_refresh"]) {
    const cookie = cookies.find((item) => item.name === name);
    expect(Boolean(cookie?.value), `Missing ${name}`).toBe(true);
    expect(cookie?.httpOnly, `${name} must be HttpOnly`).toBe(true);
    expect(cookie?.secure, `${name} must be Secure`).toBe(true);
    expect(cookie?.sameSite, `${name} must be SameSite=Lax`).toBe("Lax");
    expect(cookie?.path).toBe("/");
    expect(cookie?.domain).toBe(new URL(page.url()).hostname);
  }
  const exposed = await page.evaluate(() => {
    const values = [document.cookie, ...Object.values(localStorage), ...Object.values(sessionStorage)];
    const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
    return /tranxit_(session|refresh|dev_verification_code)=/.test(document.cookie) ||
      keys.some((key) => /^(access_?token|refresh_?token|tranxit_session|tranxit_refresh)$/i.test(key)) ||
      values.some((value) => /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|\b\d+\.[A-Za-z0-9_-]{32,}\b/.test(value));
  });
  expect(exposed, "Credentials must remain inaccessible to browser JavaScript").toBe(false);
}

export async function loginActor(actor: Actor, page = actor.page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(actor.email);
  await page.getByLabel("Password", { exact: true }).fill(actor.password);
  const login = await roundTrip(page, "/api/auth/login", "POST", () => page.getByRole("button", { name: "Sign in", exact: true }).click());
  const identity = publicIdentity(login.response);
  expect(identity.id).toBeGreaterThan(0);
  expect(identity.role).toBe(actor.role);
  expect(identity.isEmailVerified).toBe(true);
  await expect(page).toHaveURL(actor.role === "Customer" ? /\/dashboard$/ : /\/courier\/dashboard$/);
  await expectSecureSession(page);
  return identity;
}

function optionId(options: Option[], name: string) {
  const option = options.find((item) => item.name === name);
  expect(Boolean(option), `Production reference option missing: ${name}`).toBe(true);
  return String(option!.id);
}

export async function createJob(page: Page) {
  const loaded = await roundTrip(page, "/api/lookups", "GET", () => page.goto("/jobs/new"));
  const lookups = successValue<Lookups>(loaded.response);
  for (const name of ["countries", "cargoModes", "courierModes", "itemTypes", "deliveryTypes"] as const) {
    expect(lookups[name].length, `Production ${name} must be populated`).toBeGreaterThan(0);
  }
  const selected = {
    originCountryId: optionId(lookups.countries, "Germany"),
    destinationCountryId: optionId(lookups.countries, "United Arab Emirates"),
    cargoModeId: optionId(lookups.cargoModes, "Air freight"),
    courierModeId: optionId(lookups.courierModes, "Warehouse pickup"),
    itemTypeId: optionId(lookups.itemTypes, "Machinery"),
    deliveryTypeId: optionId(lookups.deliveryTypes, "Express"),
  };
  await page.getByLabel("Origin country").selectOption(selected.originCountryId);
  await page.getByLabel("Destination country").selectOption(selected.destinationCountryId);
  await page.getByLabel("Origin city").selectOption({ label: "Berlin" });
  await page.getByLabel("Destination city").selectOption({ label: "Dubai" });
  await page.getByLabel("Cargo mode").selectOption(selected.cargoModeId);
  await page.getByLabel("Service").selectOption(selected.courierModeId);
  await page.getByLabel("Item type").selectOption(selected.itemTypeId);
  await page.getByLabel("Speed").selectOption(selected.deliveryTypeId);
  const itemName = `Edge instruments ${randomBytes(6).toString("hex")}`;
  const inputs: Record<string, string> = {
    originAddress: "17 Test Avenue, Berlin",
    destinationAddress: "48 Test Depot, Dubai",
    recipientName: "Edge Shipment Recipient",
    recipientEmail: `recipient-${randomBytes(6).toString("hex")}@example.test`,
    recipientContact: "+971 50 123 4567",
    itemName,
    quantity: "11", weight: "287", declaredValue: "345678",
    pickupDate: new Date(Date.now() + 4 * 86_400_000).toISOString().slice(0, 10),
    description: "Fixture instruments requiring careful handling.",
  };
  for (const [name, value] of Object.entries(inputs)) {
    await page.locator(`form :is(input, textarea)[name="${name}"]`).fill(value);
  }
  const created = await roundTrip(page, "/api/jobs", "POST", () => page.getByRole("button", { name: "Confirm & request bids", exact: true }).click());
  const value = successValue<{ jobId: number }>(created.response, 201);
  expect(value.jobId).toBeGreaterThan(0);
  const payload = created.request.postDataJSON() as Record<string, unknown>;
  for (const [key, id] of Object.entries(selected)) expect(payload[key], key).toBe(Number(id));
  expect(object((payload.jobItems as unknown[])[0]).quantity).toBe(11);
  expect(object((payload.jobItems as unknown[])[0]).weight).toBe(287);
  await expect(page).toHaveURL(new RegExp(`/jobs/${value.jobId}/bids$`));
  return { id: value.jobId, itemName, payload };
}

export async function expectPersistedJob(page: Page, job: { id: number; itemName: string }, won = false) {
  await page.goto(`/jobs/${job.id}`);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Berlin to Dubai", exact: true })).toBeVisible();
  await expect(page.getByText("Air freight", { exact: true })).toBeVisible();
  const item = page.getByRole("row").filter({ hasText: job.itemName });
  await expect(item.getByRole("cell").nth(1)).toHaveText("11");
  await expect(item.getByRole("cell").nth(2)).toHaveText("287 kg");
  if (won) await expect(page.getByText("Won", { exact: true })).toBeVisible();
}

export async function placeBid(page: Page, jobId: number) {
  await page.goto("/courier/jobs");
  await page.reload();
  await page.locator(`a[href="/courier/jobs/${jobId}/bid"]`).click();
  await expect(page.getByRole("button", { name: "Submit bid", exact: true })).toBeEnabled();
  const values = {
    oceanFreight: "129300", handlingCharges: "4700", customClearanceCharges: "2300",
    pickupCharges: "1800", notes: "Edge delivery with protective packaging.",
    deliveryDate: new Date(Date.now() + 9 * 86_400_000).toISOString().slice(0, 10),
  };
  for (const [name, value] of Object.entries(values)) {
    await page.locator(`form :is(input, textarea)[name="${name}"]`).fill(value);
  }
  await page.getByLabel("Delivery type").selectOption({ label: "Express" });
  const submitted = await roundTrip(page, "/api/bids", "POST", () => page.getByRole("button", { name: "Submit bid", exact: true }).click());
  const value = successValue<{ bidId: number }>(submitted.response, 201);
  expect(value.bidId).toBeGreaterThan(0);
  const payload = submitted.request.postDataJSON() as Record<string, unknown>;
  expect(payload.pickupCharges).toBe(1800);
  expect(payload.handlingCharges).toBe(4700);
  expect(payload.customClearanceCharges).toBe(2300);
  // Quote composition is an owner decision in Batch 5, not an edge-routing assertion.
  await expect(page).toHaveURL(new RegExp(`/courier/jobs/${jobId}$`));
  await page.reload();
  await expect(page.getByText("Warehouse pickup", { exact: true })).toBeVisible();
  return { id: value.bidId, payload };
}

export async function customerJobIds(page: Page): Promise<number[]> {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Shipment board", exact: true })).toBeVisible();
  const shipments = page.getByRole("main").locator('a[href^="/jobs/"]')
    .filter({ has: page.getByRole("heading", { level: 3 }) });
  await expect(shipments.first()).toBeVisible();
  return shipments.evaluateAll((links) => {
    const ids = links.map((link) => Number(link.getAttribute("href")?.match(/^\/jobs\/(\d+)(?:\/|$)/)?.[1])).filter((id) => id > 0);
    return Array.from(new Set(ids)).sort((a, b) => a - b);
  });
}
