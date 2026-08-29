import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import env from "./edge-env.cjs";

test("T-E2E-EDGE.GeneratedRuntimeIsolation", () => {
  // UC-NFR-7, UC-NFR-9
  const first = env.createRuntime();
  const second = env.createRuntime();
  assert.ok(first.projectName !== second.projectName);
  assert.match(first.projectName, /^tranxit-edge-test-[a-f0-9]{16}$/);
  for (const key of Object.keys(first.secrets)) assert.ok(first.secrets[key] !== second.secrets[key]);
  assert.equal(path.dirname(env.runtimePaths(first).dir), env.runtimeRoot);
  assert.ok(env.origins(first).app.startsWith("https://tranxit-edge.localhost:"));
});

test("T-E2E-EDGE.RejectUnsafeTargets", () => {
  // UC-NFR-9
  for (const project of ["tranxit", "tranxit-prod", "tranxit-staging", "tranxit-edge-test-../prod", "tranxit-edge-test-1234"]) {
    assert.throws(() => env.assertProjectName(project));
  }
  for (const port of [80, 443, 3000, 3100, 8082, 18088, 18188, 65536, "not-a-port"]) {
    assert.throws(() => env.assertPort(port));
  }
  env.assertLocalDockerHost("unix:///var/run/docker.sock");
  env.assertLocalDockerHost("npipe:////./pipe/dockerDesktopLinuxEngine");
  for (const host of ["ssh://server", "tcp://127.0.0.1:2375", "https://remote.invalid", "npipe:////server/pipe/docker_engine"]) {
    assert.throws(() => env.assertLocalDockerHost(host));
  }
});

test("T-E2E-EDGE.IgnoreAmbientEnvironment", () => {
  // UC-NFR-7, UC-AUTH-10, UC-NFR-9
  const poison = {
    JWT_SECRET: "ambient-credential-must-not-be-used",
    TRANXIT_ADMISSION_DIR: "/real-deployment/admission",
    TRANXIT_API_URL: "https://nonfixture.invalid",
    PLAYWRIGHT_BASE_URL: "https://nonfixture.invalid",
    DOCKER_HOST: "tcp://remote.invalid:2375",
    NODE_OPTIONS: "--inspect", NODE_TLS_REJECT_UNAUTHORIZED: "0", COMPOSE_PROJECT_NAME: "production",
  };
  const previous = Object.fromEntries(Object.keys(poison).map((key) => [key, process.env[key]]));
  try {
    Object.assign(process.env, poison);
    const runtime = env.createRuntime();
    const actual = env.composeEnv(runtime);
    assert.ok(actual.JWT_SECRET === runtime.secrets.jwtSecret);
    assert.equal(actual.TRANXIT_ADMISSION_DIR, env.runtimePaths(runtime).admission);
    assert.equal(actual.TRANXIT_EDGE_CADDYFILE, env.productionCaddyfile);
    assert.equal(actual.AUTH_RATE_LIMIT_EVENTS, "100");
    assert.equal(actual.AUTH_RATE_LIMIT_WINDOW, "10s");
    assert.equal(actual.TRANXIT_INTERNAL_API_URL, "http://ocelotapigw:8080");
    assert.equal(actual.TRANXIT_E2E_EXPOSE_DEV_CODE, "false");
    for (const key of ["DOCKER_HOST", "NODE_OPTIONS", "NODE_TLS_REJECT_UNAUTHORIZED", "PLAYWRIGHT_BASE_URL", "COMPOSE_PROJECT_NAME"]) {
      assert.equal(actual[key], undefined);
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("T-E2E-EDGE.RedactedDiagnostics", () => {
  // UC-AUTH-10
  const runtime = env.createRuntime();
  const basic = Buffer.from(`${runtime.secrets.mailUser}:${runtime.secrets.mailPassword}`).toString("base64");
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url")}.${randomBytes(24).toString("base64url")}.${randomBytes(32).toString("base64url")}`;
  const refresh = `7.${randomBytes(32).toString("base64url")}`;
  const sensitive = [...Object.values(runtime.secrets), basic, jwt, refresh, "012345"];
  const safe = env.redact(`${sensitive.join("\n")}\n{"Authorization":["Basic ${basic}"]}`, runtime);
  for (const value of sensitive) assert.ok(!safe.includes(value));
  assert.ok(safe.includes("[redacted"));
});

test("T-E2E-EDGE.RestrictedFixtureGateAndCleanup", () => {
  // UC-NFR-9, UC-AUTH-10
  const runtime = env.createRuntime();
  const activeBefore = fs.existsSync(env.activeFile) ? fs.readFileSync(env.activeFile, "utf8") : null;
  const files = env.prepareRuntime(runtime);
  try {
    assert.ok(!fs.existsSync(files.gate));
    env.setAdmission({ ...runtime, admission: "/not-the-fixture" }, true);
    assert.ok(fs.statSync(files.gate).isFile());
    env.setAdmission(runtime, false);
    assert.ok(!fs.existsSync(files.gate));
    if (process.platform !== "win32") {
      assert.equal(fs.statSync(files.dir).mode & 0o777, 0o700);
      assert.equal(fs.statSync(files.state).mode & 0o777, 0o600);
    }
  } finally {
    env.retireRuntime(runtime, true);
  }
  assert.ok(!fs.existsSync(files.dir));
  assert.equal(fs.existsSync(env.activeFile) ? fs.readFileSync(env.activeFile, "utf8") : null, activeBefore);
});

test("T-E2E-EDGE.RuntimeExcludedFromBuildAndGit", () => {
  // UC-AUTH-10, UC-NFR-7
  const runtime = env.createRuntime();
  const relative = path.relative(env.frontendRoot, env.runtimePaths(runtime).state).replaceAll("\\", "/");
  assert.ok(relative.startsWith("e2e/.auth/"));
  for (const file of [".gitignore", ".dockerignore"]) {
    assert.match(fs.readFileSync(path.join(env.frontendRoot, file), "utf8"), /^\/?e2e\/\.auth\/?\r?$/m);
  }
});
