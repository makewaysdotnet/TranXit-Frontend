import { test, expect } from "./edge.fixture";
import { origins } from "../scripts/edge-env.cjs";
import {
  browserJson, createJob, customerJobIds, expectDenied, expectNoTokens,
  expectPersistedJob, expectSecureSession, loginActor, placeBid, publicIdentity, roundTrip,
  successValue,
} from "./browser-helpers";

// The existing Development suite scans all *.spec.ts. Never run these against it.
test("T-E2E-EDGE.CookieOnlyGoldenFlow", async ({ edge }) => {
  // UC-NFR-7, UC-AUTH-1, UC-AUTH-2, UC-AUTH-3, UC-AUTH-7, UC-CUST-2, UC-CUST-4, UC-CUST-5, UC-COUR-2, UC-COUR-4
  const customer = await edge.register("Customer");
  const courier = await edge.register("Courier");
  await customer.page.goto("/courier/dashboard");
  await expect(customer.page).toHaveURL(/\/dashboard$/);
  await courier.page.goto("/dashboard");
  await expect(courier.page).toHaveURL(/\/courier\/dashboard$/);

  const job = await createJob(customer.page);
  await expectPersistedJob(customer.page, job);
  expectDenied(await browserJson(courier.page, "/api/jobs", { method: "POST", body: job.payload }), 403);
  const bid = await placeBid(courier.page, job.id);
  expectDenied(await browserJson(customer.page, "/api/bids", { method: "POST", body: bid.payload }), 403);

  await customer.page.goto(`/jobs/${job.id}/bids`);
  await customer.page.reload();
  await expect(customer.page.getByText(courier.name, { exact: true })).toBeVisible();
  await expect(customer.page.getByRole("heading", { name: `Bid offer #${bid.id}`, exact: true })).toBeVisible();
  await expect(customer.page.getByText(bid.display, { exact: true })).toBeVisible();
  const accepted = await roundTrip(customer.page, "/api/bids/status", "PUT", () => customer.page.getByRole("button", { name: "Accept bid", exact: true }).click());
  successValue(accepted.response);
  const award = accepted.request.postDataJSON() as { bidId: number; bidProposalId: number; status: number };
  expect(award.bidId).toBe(bid.id);
  expect(award.bidProposalId).toBeGreaterThan(0);
  expect(award.status).toBe(3);
  expectDenied(await browserJson(courier.page, "/api/bids/status", { method: "PUT", body: award }), 403);
  const otherCustomer = await edge.register("Customer");
  expectDenied(await browserJson(otherCustomer.page, "/api/bids/status", { method: "PUT", body: award }), 403);

  await customer.page.reload();
  await expect(customer.page.getByRole("button", { name: "Bid accepted", exact: true })).toBeDisabled();
  await expect(customer.page.getByText(bid.display, { exact: true })).toBeVisible();
  const proposals = customer.page.getByRole("button", { name: /^Proposals \(/ });
  await expect(proposals).toHaveAttribute("aria-expanded", "false");
  await proposals.click();
  await expect(proposals).toHaveAttribute("aria-expanded", "true");
  const history = customer.page.locator(`#bid-${bid.id}-proposals`);
  await expect(history.getByText(new RegExp(`^Proposal #${award.bidProposalId}\\s*Accepted$`))).toBeVisible();
  await expect(history.getByText("Accepted", { exact: true })).toBeVisible();
  await expect(history.getByText(bid.display, { exact: true })).toBeVisible();
  await proposals.click();
  await expect(proposals).toHaveAttribute("aria-expanded", "false");
  await expectPersistedJob(customer.page, job, true);
  await courier.page.goto(`/courier/jobs/${job.id}`);
  await courier.page.reload();
  await expect(courier.page.getByText("Won", { exact: true })).toBeVisible();
  await expectSecureSession(customer.page);
  await expectSecureSession(courier.page);

  const requests = await edge.requests();
  for (const [method, path] of [
    ["POST", "/api/auth/register"], ["POST", "/api/auth/verify-email"],
    ["POST", "/api/auth/login"], ["GET", "/api/lookups"],
    ["POST", "/api/jobs"], ["POST", "/api/bids"], ["PUT", "/api/bids/status"],
  ]) {
    expect(requests.some((request) => request.method === method && request.path === path), `Missing real browser round trip: ${method} ${path}`).toBe(true);
  }
  expect(requests.some((request) => request.path.startsWith("/api/lookups/cities/"))).toBe(true);
  for (const path of ["/api/lookups", "/api/jobs", "/api/bids", "/api/bids/status"]) {
    expect(requests.filter((request) => request.path === path).every((request) => request.cookieNames.includes("tranxit_session") && !request.authorization), `Expected cookie-only requests for ${path}`).toBe(true);
  }
});

test("T-E2E-EDGE.ZeroQuoteRoundTrip", async ({ edge }) => {
  // UC-COUR-4, UC-CUST-4, UC-CUST-5
  const customer = await edge.register("Customer");
  const courier = await edge.register("Courier");
  const job = await createJob(customer.page);
  const bid = await placeBid(courier.page, job.id, true);
  await courier.page.goto("/courier/jobs");
  const row = courier.page.locator("div.rounded-lg.border").filter({ has: courier.page.locator(`a[href="/courier/jobs/${job.id}"]`) });
  await expect(row.getByRole("button", { name: "View bid", exact: true })).toBeVisible();
  await expect(row.getByText(bid.display, { exact: true })).toBeVisible();
  await customer.page.goto(`/jobs/${job.id}/bids`);
  await expect(customer.page.getByText(bid.display, { exact: true })).toBeVisible();
  const accepted = await roundTrip(customer.page, "/api/bids/status", "PUT", () => customer.page.getByRole("button", { name: "Accept bid", exact: true }).click());
  successValue(accepted.response);
  await customer.page.reload();
  await expect(customer.page.getByRole("button", { name: "Bid accepted", exact: true })).toBeDisabled();
  await expect(customer.page.getByText(bid.display, { exact: true })).toBeVisible();
  await expectPersistedJob(customer.page, job, true);
});

test("T-E2E-EDGE.UnauthenticatedDenied", async ({ edge }) => {
  // UC-NFR-7, UC-AUTH-7
  const page = await edge.newPage();
  await page.goto("/login");
  successValue(await browserJson(page, "/api/roles"));
  expectDenied(await browserJson(page, "/api/lookups"), 401);
  expectDenied(await browserJson(page, "/api/lookups/cities/1"), 401);
  expectDenied(await browserJson(page, "/api/jobs", { method: "POST", body: {} }), 401);
  expectDenied(await browserJson(page, "/api/bids", { method: "POST", body: {} }), 401);
  expectDenied(await browserJson(page, "/api/bids/status", { method: "PUT", body: { bidId: 1, bidProposalId: 1, status: 3 } }), 401);
  expectDenied(await browserJson(page, "/api/auth/refresh", { method: "POST" }), 401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await page.goto("/courier/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fcourier%2Fdashboard$/);
});

test("T-E2E-EDGE.RawAuthAliasesContained", async ({ edge }) => {
  // UC-NFR-7, UC-AUTH-7, UC-AUTH-10
  const actor = await edge.register("Customer");
  const secondary = await edge.newPage(origins(edge.runtime).secondary);
  await loginActor(actor, secondary);
  const namespaces = [
    "/api", "/API", "/Api", "/api/v1", "/api/account", "/api/accountservice",
    "/api/authentication", "/accountservice/api", "/AccountService/api",
    "/ocelotapigw/api", "/gateway/api", "/courierjobservice/api",
  ];
  const aliases = [
    ...namespaces.flatMap((prefix) => ["login", "refresh"].flatMap((name) => [`${prefix}/${name}`, `${prefix}/${name}/`])),
    "/api/Login", "/api/Refresh", "/api/LOGIN/", "/api/REFRESH/",
    "/api//login", "/api//refresh", "/api/%6cogin", "/api/%72efresh",
    "/api/auth/../login", "/api/auth/../refresh", "/api/login/google", "/api/Login/Google/",
    "/api/auth/login/google", "/api/auth/Login", "/api/auth/Refresh", "/API/AUTH/refresh",
  ];
  for (const page of [actor.page, secondary]) {
    const before = (await page.context().cookies()).find((cookie) => cookie.name === "tranxit_refresh")?.value;
    for (const path of aliases) {
      const response = await browserJson(page, path, {
        method: "POST",
        ...(/login|%6cogin/i.test(path) ? { body: { email: actor.email, password: actor.password } } : {}),
      });
      expectNoTokens(response);
      expect([401, 404, 405], `Raw alias must fail closed: ${path}`).toContain(response.status);
    }
    for (const path of ["/api/login", "/api/refresh", "/api/Login/", "/api/Refresh/"]) {
      const response = await browserJson(page, path);
      expectNoTokens(response);
      expect([401, 404, 405], `Raw GET alias must fail closed: ${path}`).toContain(response.status);
    }
    const ambient = await browserJson(page, "/api/refresh", { method: "POST", body: { refreshToken: null } });
    expectNoTokens(ambient);
    expect([401, 404, 405]).toContain(ambient.status);
    const after = (await page.context().cookies()).find((cookie) => cookie.name === "tranxit_refresh")?.value;
    expect(Boolean(before) && before === after, "Raw aliases must not rotate browser cookies").toBe(true);
    // A successful refresh proves an alias did not silently consume the server credential.
    publicIdentity(await browserJson(page, "/api/auth/refresh", { method: "POST" }));
    const login = await browserJson(page, "/api/auth/login/", { method: "POST", body: { email: actor.email, password: actor.password } });
    expect(publicIdentity(login).role).toBe("Customer");
    await expectSecureSession(page);
  }
});

test("T-E2E-EDGE.BffRefreshLogout", async ({ edge }) => {
  // UC-NFR-7, UC-AUTH-3, UC-AUTH-10
  const actor = await edge.register("Customer");
  // A raw gateway logout alias must not revoke an ambient browser credential.
  // Some edges reject the alias before AccountService; either boundary is safe.
  const ambientLogout = await browserJson(actor.page, "/api/logout", { method: "POST" });
  expectNoTokens(ambientLogout);
  expect([401, 404, 405]).toContain(ambientLogout.status);
  publicIdentity(await browserJson(actor.page, "/api/auth/refresh", { method: "POST" }));
  const before = await actor.page.context().cookies();
  // JWT issue timestamps have whole-second precision; cross that boundary explicitly.
  await new Promise((resolve) => setTimeout(resolve, 1_100));
  const refresh = await browserJson(actor.page, "/api/auth/refresh", { method: "POST" });
  expect(publicIdentity(refresh).role).toBe("Customer");
  const rotated = await actor.page.context().cookies();
  for (const name of ["tranxit_session", "tranxit_refresh"]) {
    expect(before.find((cookie) => cookie.name === name)?.value !== rotated.find((cookie) => cookie.name === name)?.value, `${name} must rotate`).toBe(true);
  }
  await expectSecureSession(actor.page);
  publicIdentity(await browserJson(actor.page, "/api/auth/refresh/", { method: "POST" }));
  const beforeLogout = await actor.page.context().cookies();
  expect(successValue<boolean>(await browserJson(actor.page, "/api/auth/logout", { method: "POST" }))).toBe(true);
  expect(successValue<boolean>(await browserJson(actor.page, "/api/auth/logout", { method: "POST" }))).toBe(true);
  expect((await actor.page.context().cookies()).some((cookie) => ["tranxit_session", "tranxit_refresh"].includes(cookie.name))).toBe(false);
  expectDenied(await browserJson(actor.page, "/api/auth/refresh", { method: "POST" }), 401);
  expectDenied(await browserJson(actor.page, "/api/lookups"), 401);
  for (const cookies of [before, beforeLogout]) {
    // Memory-only replay proves backend family revocation, not just cookie deletion.
    const replay = await edge.newPage(undefined, cookies);
    await replay.goto("/");
    expectDenied(await browserJson(replay, "/api/auth/refresh", { method: "POST" }), 401);
  }
});

test("T-E2E-EDGE.AdmissionGatePreservesWrites", async ({ edge }) => {
  // UC-NFR-9, UC-CUST-2, UC-AUTH-7
  const actor = await edge.register("Customer");
  const job = await createJob(actor.page);
  const acknowledged = await customerJobIds(actor.page);
  expect(acknowledged).toEqual([job.id]);
  const secondary = await edge.newPage(origins(edge.runtime).secondary);
  await loginActor(actor, secondary);
  const routes = [
    "/", "/about", "/contact", "/login", "/register", "/verify-email", "/dashboard",
    "/jobs/new", `/jobs/${job.id}`, `/jobs/${job.id}/bids`, "/settings", "/courier/dashboard",
    "/courier/jobs", `/courier/jobs/${job.id}`, `/courier/jobs/${job.id}/bid`, "/courier/settings",
    "/api/roles", "/api/lookups", "/api/refresh", "/api/login", "/api/accountservice/refresh",
  ];
  const spoofedHeaders: Record<string, string>[] = [
    {},
    { "X-Tranxit-Private-Smoke": "1", "X-Tranxit-Admission": "open" },
    { "X-Forwarded-For": "127.0.0.1", "X-Real-IP": "127.0.0.1" },
    { "X-Forwarded-Host": "caddy:8082", "X-Forwarded-Port": "8082", "X-Forwarded-Proto": "http" },
    { Forwarded: 'for=127.0.0.1;host="caddy:8082";proto=http', "X-Original-URL": "/api/jobs" },
  ];
  try {
    edge.admit(false);
    for (const page of [actor.page, secondary]) {
      const closed = await page.reload();
      expect(closed?.status()).toBe(503);
      expect(closed?.headers()["retry-after"]).toBe("60");
      for (const route of routes) expectDenied(await browserJson(page, route), 503);
      for (const headers of spoofedHeaders) {
        expectDenied(await browserJson(page, "/api/roles", { headers }), 503);
        expectDenied(await browserJson(page, "/api/jobs", { method: "POST", headers, body: job.payload }), 503);
      }
      for (const path of ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout", "/api/bids"]) {
        expectDenied(await browserJson(page, path, { method: "POST", body: {} }), 503);
      }
      expectDenied(await browserJson(page, "/api/bids/status", { method: "PUT", body: {} }), 503);
    }
    await edge.privateSmoke();
  } finally {
    edge.admit(true);
  }
  expect(await customerJobIds(actor.page), "Closed admission must not create jobs or discard an acknowledged job").toEqual(acknowledged);
  await expectPersistedJob(actor.page, job);
  for (const page of [actor.page, secondary]) successValue(await browserJson(page, "/api/roles"));
});
