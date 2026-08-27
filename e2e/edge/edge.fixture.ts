import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  expect, test as base, type BrowserContext, type Cookie, type Page,
} from "@playwright/test";
import {
  createRuntime, frontendRoot, isolatedEnv, loadRuntime, localHttps, origins, setAdmission,
} from "../scripts/edge-env.cjs";
import {
  expectNoDevelopmentCookies, loginActor, object, publicIdentity, roundTrip, successValue,
  type Actor,
} from "./browser-helpers";

export type EdgeRuntime = ReturnType<typeof createRuntime>;
type RequestEvidence = { path: string; method: string; cookieNames: string[]; authorization: boolean };
type EdgeFixture = {
  runtime: EdgeRuntime;
  newPage: (origin?: string, cookies?: Cookie[]) => Promise<Page>;
  register: (role: Actor["role"]) => Promise<Actor>;
  admit: (open: boolean) => void;
  privateSmoke: () => Promise<void>;
  requests: () => Promise<RequestEvidence[]>;
};

async function readOtp(runtime: EdgeRuntime, email: string): Promise<string> {
  const headers = { Authorization: `Basic ${Buffer.from(`${runtime.secrets.mailUser}:${runtime.secrets.mailPassword}`).toString("base64")}` };
  const baseURL = origins(runtime).mail;
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const search = await localHttps(runtime, baseURL, `/api/v1/search?query=${encodeURIComponent(`to:${email}`)}&limit=10`, headers) as { status: number; body: string };
    expect(search.status, "Authenticated fixture Mailpit search failed").toBe(200);
    const messages = object(JSON.parse(search.body)).messages;
    for (const entry of Array.isArray(messages) ? messages : []) {
      const message = object(entry);
      const recipients = Array.isArray(message.To) ? message.To : [];
      if (!recipients.some((recipient) => object(recipient).Address === email)) continue;
      if (typeof message.ID !== "string" || message.Subject !== "Email Verification") continue;
      const response = await localHttps(runtime, baseURL, `/api/v1/message/${encodeURIComponent(message.ID)}`, headers) as { status: number; body: string };
      expect(response.status, "Authenticated fixture Mailpit message read failed").toBe(200);
      const code = String(object(JSON.parse(response.body)).Text ?? "").trim();
      if (/^\d{6}$/.test(code)) return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("No verification OTP arrived in the fixture's Mailpit inbox within 60 seconds.");
}

export const test = base.extend<{ edge: EdgeFixture }, { edgeRuntime: EdgeRuntime }>({
  edgeRuntime: [async ({}, provide) => {
    const runtime = loadRuntime() as EdgeRuntime;
    expect(runtime.projectName === process.env.TRANXIT_EDGE_PROJECT, "Use the guarded edge-stack test wrapper").toBe(true);
    expect(runtime.phase).toBe("ready");
    await provide(runtime);
  }, { scope: "worker" }],
  edge: async ({ browser, edgeRuntime, viewport, isMobile, hasTouch, deviceScaleFactor, userAgent }, provide) => {
    const contexts: BrowserContext[] = [];
    const pending: Promise<RequestEvidence>[] = [];
    const urls = origins(edgeRuntime);
    const newPage = async (origin = urls.app, cookies: Cookie[] = []) => {
      expect([urls.app, urls.secondary].includes(origin), "Browser fixture is local-only").toBe(true);
      const context = await browser.newContext({
        baseURL: origin, viewport, isMobile, hasTouch, deviceScaleFactor, userAgent,
        // Exception is confined to these disposable contexts and Caddy's local CA.
        ignoreHTTPSErrors: true, serviceWorkers: "block",
      });
      contexts.push(context);
      if (cookies.length) await context.addCookies(cookies);
      const page = await context.newPage();
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (![urls.app, urls.secondary].includes(url.origin) || !/^\/api\//i.test(url.pathname)) return;
        pending.push(request.allHeaders().then((headers) => ({
          path: url.pathname, method: request.method(),
          cookieNames: (headers.cookie ?? "").split(";").map((cookie) => cookie.trim().split("=", 1)[0]).filter(Boolean),
          authorization: Boolean(headers.authorization),
        })));
      });
      return page;
    };
    const register = async (role: Actor["role"]): Promise<Actor> => {
      const id = randomBytes(8).toString("hex");
      const page = await newPage();
      const actor: Actor = {
        page, role, email: `edge-${role.toLowerCase()}-${id}@example.test`,
        name: `Edge ${role} ${id}`, password: edgeRuntime.secrets.actorPassword,
      };
      await page.goto("/register");
      await page.getByLabel("Full name", { exact: true }).fill(actor.name);
      await page.getByLabel("Phone", { exact: true }).fill("+92 300 812 3456");
      await page.getByLabel("Portal").selectOption(role);
      await page.getByLabel("Email", { exact: true }).fill(actor.email);
      await page.getByLabel("Password", { exact: true }).fill(actor.password);
      await page.getByLabel("Confirm password", { exact: true }).fill(actor.password);
      const registration = await roundTrip(page, "/api/auth/register", "POST", () => page.getByRole("button", { name: "Create account", exact: true }).click());
      const identity = publicIdentity(registration.response);
      expect(identity.id).toBeGreaterThan(0);
      expect(identity.role).toBe(role);
      expect(identity.isEmailVerified).toBe(false);
      await expect(page).toHaveURL(/\/verify-email$/);
      await expectNoDevelopmentCookies(page);
      expect((await page.context().cookies()).some((cookie) => cookie.name === "tranxit_session")).toBe(false);
      const otp = await readOtp(edgeRuntime, actor.email);
      await page.getByLabel("Verification code", { exact: true }).fill(otp);
      const verification = await roundTrip(page, "/api/auth/verify-email", "POST", () => page.getByRole("button", { name: "Verify email", exact: true }).click());
      expect(successValue<boolean>(verification.response)).toBe(true);
      await expect(page).toHaveURL(/\/login\?verified=1$/);
      await loginActor(actor);
      return actor;
    };
    try {
      await provide({
        runtime: edgeRuntime, newPage, register,
        admit: (open) => setAdmission(edgeRuntime, open),
        privateSmoke: async () => {
          try {
            await promisify(execFile)(process.execPath, ["e2e/scripts/edge-stack.mjs", "smoke-private"], {
              cwd: frontendRoot, env: isolatedEnv(), windowsHide: true, timeout: 60_000,
            });
          } catch {
            throw new Error("The same-Caddy private BFF listener was not healthy while public admission was closed.");
          }
        },
        requests: () => Promise.all(pending),
      });
      const evidence = await Promise.all(pending);
      expect(evidence.some((request) => request.authorization), "Browser requests must never receive a Bearer credential").toBe(false);
    } finally {
      for (const context of contexts) await context.close();
    }
  },
});

export { expect } from "@playwright/test";
