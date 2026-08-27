import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import edgeEnvironment from "./edge-env.cjs";

const {
  activeFile, assertComposeModel, assertLocalDockerHost, assertPort, backendRoot,
  composeEnv, composeFiles, createRuntime, frontendRoot, isolatedEnv, loadRuntime,
  localHttps, origins, prepareRuntime, redact, requireInvariant, retireRuntime,
  runtimePaths, saveRuntime, setAdmission,
} = edgeEnvironment;

const action = process.argv[2];
const testArgs = process.argv.slice(3).filter((arg) => arg !== "--");
const actions = ["up", "down", "ready", "logs", "check", "test", "smoke-private"];
const playwrightCli = createRequire(import.meta.url).resolve("@playwright/test/cli");
let runtime;
let child;
let interrupted = false;

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    interrupted = true;
    child?.kill(signal);
  });
}

function writeLog(label, output, fixture = runtime) {
  if (!fixture) return;
  const file = path.join(runtimePaths(fixture).logs, `${action}.log`);
  fs.appendFileSync(file, `\n[${new Date().toISOString()}] ${label}\n${redact(output, fixture)}\n`, { mode: 0o600 });
}

async function execute(command, args, options = {}) {
  const { label = command, quiet = false, input, env = isolatedEnv(), print = false } = options;
  const result = await new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let finished = false;
    child = spawn(command, args, {
      cwd: frontendRoot, env, windowsHide: true, shell: false,
      stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });
    const timer = setInterval(() => console.log(`[edge] ${label} is still running.`), 15_000);
    const finish = (code) => {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      child = undefined;
      resolve({ code, stdout, stderr });
    };
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", () => { stderr += "Unable to start the requested local tool."; finish(1); });
    child.on("close", (code) => finish(code ?? 1));
    if (input !== undefined) {
      child.stdin.on("error", () => {});
      child.stdin.end(input);
    }
  });
  // Config and password hashing return credentials: keep their stdout only in memory.
  if (!quiet) writeLog(label, `${result.stdout}\n${result.stderr}`);
  else if (result.code !== 0) writeLog(label, result.stderr);
  if (print) process.stdout.write(redact(`${result.stdout}\n${result.stderr}`, runtime));
  requireInvariant(!interrupted, "Edge command interrupted; the fixture remains available for scoped cleanup.");
  return result;
}

async function checked(command, args, options) {
  const result = await execute(command, args, options);
  requireInvariant(result.code === 0, `${options.label} failed (exit ${result.code}). See the restricted edge logs.`);
  return result.stdout;
}

function dockerArgs(args) {
  return ["--context", runtime.dockerContext, ...args];
}

function composeArgs(args) {
  return dockerArgs([
    "compose", "--progress", "plain", "--project-name", runtime.projectName,
    "--project-directory", backendRoot, "--env-file", runtimePaths(runtime).envFile,
    ...composeFiles.flatMap((file) => ["-f", file]), ...args,
  ]);
}

function compose(args, options = {}) {
  return checked("docker", composeArgs(args), {
    label: `compose ${args[0]}`, env: composeEnv(runtime), ...options,
  });
}

async function resolveLocalContext() {
  const context = runtime.dockerContext || (await checked("docker", ["context", "show"], {
    label: "resolve local Docker context", quiet: true,
  })).trim();
  requireInvariant(/^[a-zA-Z0-9_.-]+$/.test(context), "Invalid Docker context name.");
  const endpoint = await checked("docker", ["context", "inspect", context, "--format", "{{json .Endpoints.docker.Host}}"], {
    label: "inspect local Docker endpoint", quiet: true,
  });
  assertLocalDockerHost(JSON.parse(endpoint));
  runtime.dockerContext = context;
  saveRuntime(runtime);
}

async function validateCompose() {
  for (const file of composeFiles) requireInvariant(fs.existsSync(file), `Missing compose input: ${path.basename(file)}.`);
  const output = await compose(["config", "--format", "json"], { quiet: true, label: "validate isolated Compose model" });
  let model;
  try { model = JSON.parse(output); } catch { throw new Error("Compose did not return a valid JSON model."); }
  assertComposeModel(model, runtime);
  console.log("[edge] Production model, loopback ports, admission mount and resource isolation checked.");
}

async function verifyTopology(requireRunning = true) {
  const output = await checked("docker", dockerArgs([
    "ps", "-aq", "--filter", `label=com.docker.compose.project=${runtime.projectName}`,
  ]), { label: "enumerate fixture containers", quiet: true });
  const ids = output.trim().split(/\s+/).filter(Boolean);
  if (!ids.length) {
    requireInvariant(!requireRunning, "No containers found for this edge fixture.");
    return;
  }
  const template = '{"name":{{json .Name}},"labels":{{json .Config.Labels}},"running":{{json .State.Running}},"ports":{{json .HostConfig.PortBindings}},"networks":{{json .NetworkSettings.Networks}}}';
  const inspected = await checked("docker", dockerArgs(["inspect", "--format", template, ...ids]), {
    label: "verify actual fixture topology", quiet: true,
  });
  const containers = inspected.trim().split(/\r?\n/).map((line) => JSON.parse(line));
  if (requireRunning) requireInvariant(containers.length === 8, "Expected exactly eight edge fixture services.");
  for (const container of containers) {
    requireInvariant(container.name.startsWith(`/${runtime.projectName}-`) && container.labels?.["com.docker.compose.project"] === runtime.projectName && container.labels?.["io.tranxit.edge-test"] === runtime.projectName, "Refusing containers without this fixture's ownership labels.");
    if (requireRunning) requireInvariant(container.running, "An edge fixture service is not running.");
    for (const network of Object.keys(container.networks ?? {})) {
      requireInvariant(network.startsWith(`${runtime.projectName}-`), "Container joined a non-fixture network.");
    }
    for (const [port, bindings] of Object.entries(container.ports ?? {})) {
      for (const binding of bindings ?? []) {
        requireInvariant(container.labels["com.docker.compose.service"] === "caddy" && port === "443/tcp" && binding.HostIp === "127.0.0.1" && binding.HostPort === String(runtime.httpsPort), "An application/private port was published outside fixture HTTPS.");
      }
    }
  }
}

async function assertFreshProject() {
  for (const [resource, args] of [
    ["containers", ["ps", "-aq"]],
    ["volumes", ["volume", "ls", "-q"]],
    ["networks", ["network", "ls", "-q"]],
  ]) {
    const found = await checked("docker", dockerArgs([...args, "--filter", `label=com.docker.compose.project=${runtime.projectName}`]), {
      label: `check fresh fixture ${resource}`, quiet: true,
    });
    requireInvariant(!found.trim(), "Refusing to reuse existing resources for a new fixture.");
  }
}

function assertRoles(body) {
  let result;
  try { result = JSON.parse(body); } catch { throw new Error("Roles smoke did not return a JSON result envelope."); }
  requireInvariant(result.isSuccess === true && Array.isArray(result.value) && ["Customer", "Courier"].every((role) => result.value.some((item) => item.name === role)), "Production migrations/reference roles are not ready.");
}

async function privateSmoke() {
  const body = await compose(["exec", "-T", "caddy", "wget", "-qO-", "http://127.0.0.1:8082/api/roles"], {
    quiet: true, label: "private same-Caddy BFF smoke",
  });
  assertRoles(body);
}

async function expectPublicStatus(status) {
  for (const origin of [origins(runtime).app, origins(runtime).secondary]) {
    const response = await localHttps(runtime, origin, "/api/roles");
    requireInvariant(response.status === status, `Public admission expected ${status}, received ${response.status}.`);
    if (status === 200) assertRoles(response.body);
  }
}

async function exportLocalCa() {
  await compose(["cp", "caddy:/data/caddy/pki/authorities/local/root.crt", runtimePaths(runtime).ca], {
    label: "export fixture-local Caddy public CA", quiet: true,
  });
  // No private key is copied and no certificate is installed in a host trust store.
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      await localHttps(runtime, origins(runtime).app, "/");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error("Caddy local TLS did not become ready.");
}

async function diagnostics(print = false) {
  if (!runtime?.dockerContext) return;
  for (const args of [["ps", "--all"], ["logs", "--no-color", "--tail", "200"]]) {
    await execute("docker", composeArgs(args), { label: `diagnostics ${args[0]}`, env: composeEnv(runtime), print });
  }
}

async function availablePort() {
  const requested = process.env.TRANXIT_EDGE_HTTPS_PORT;
  const first = assertPort(requested || 18443);
  const probe = (port) => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      const selected = server.address().port;
      server.close((error) => error ? reject(error) : resolve(selected));
    });
  });
  try { return await probe(first); } catch {
    requireInvariant(!requested, "Requested edge HTTPS port is in use; choose another TRANXIT_EDGE_HTTPS_PORT.");
    return assertPort(await probe(0));
  }
}

async function up() {
  runtime = createRuntime(await availablePort());
  prepareRuntime(runtime, true);
  await resolveLocalContext();
  await validateCompose();
  await assertFreshProject();
  await compose(["build", "caddy"], { label: "build actual Caddy image" });
  const hashed = await compose(["run", "--rm", "-T", "--no-deps", "--entrypoint", "caddy", "caddy", "hash-password", "--algorithm", "bcrypt"], {
    input: `${runtime.secrets.mailPassword}\n`, quiet: true, label: "generate local inbox password hash via stdin",
  });
  const hash = hashed.match(/\$2[aby]\$\d+\$[./A-Za-z0-9]{53}/)?.[0];
  requireInvariant(hash, "Caddy did not produce a bcrypt inbox hash.");
  runtime.secrets.mailHash = hash;
  saveRuntime(runtime);
  await validateCompose();
  await compose(["up", "--detach", "--build", "--wait", "--wait-timeout", "360"], { label: "build and start isolated production edge stack" });
  await verifyTopology();
  await exportLocalCa();
  await expectPublicStatus(503);
  await privateSmoke();
  const mail = await localHttps(runtime, origins(runtime).mail, "/");
  requireInvariant(mail.status === 401, "Staging Mailpit must remain behind basic auth.");
  setAdmission(runtime, true);
  await expectPublicStatus(200);
  runtime.phase = "ready";
  saveRuntime(runtime);
  console.log(`[edge] Ready: ${origins(runtime).app} (${runtime.projectName}).`);
}

async function ready() {
  requireInvariant(runtime.phase === "ready", "Edge fixture is not ready; inspect its logs and recreate it.");
  await verifyTopology();
  await privateSmoke();
  await expectPublicStatus(200);
}

async function down() {
  setAdmission(runtime, false);
  await verifyTopology(false);
  await diagnostics();
  await compose(["down", "--volumes", "--remove-orphans", "--timeout", "20"], { label: "remove only this edge project's containers, networks and volumes" });
  await assertFreshProject();
  retireRuntime(runtime);
  console.log(`[edge] Removed ${runtime.projectName}; credentials deleted. Sanitized logs retained in ${runtimePaths(runtime).logs}.`);
}

async function runTests(listOnly) {
  const forbidden = /^(?:--config|--output|--reporter|--workers|--trace|--ui|--debug|-c|-j)(?:=|$)/;
  requireInvariant(!testArgs.some((arg) => forbidden.test(arg)), "The edge wrapper owns config, output, reporter, worker count and credential-safe recording settings.");
  const env = isolatedEnv({
    TRANXIT_EDGE_E2E: "1",
    ...(listOnly ? {} : { TRANXIT_EDGE_PROJECT: runtime.projectName }),
  });
  const result = await execute(process.execPath, [playwrightCli, "test", "--config=playwright.edge.config.ts", ...testArgs], {
    label: listOnly ? "discover edge tests (no stack)" : "real-browser edge tests", env, print: true,
  });
  requireInvariant(result.code === 0, `Edge Playwright ${listOnly ? "discovery" : "tests"} failed (exit ${result.code}).`);
}

async function main() {
  requireInvariant(actions.includes(action), "Usage: node e2e/scripts/edge-stack.mjs <up|down|ready|logs|check|test|smoke-private> [Playwright filters]");
  if (action === "test" && testArgs.includes("--list")) return runTests(true);
  if (action === "check") {
    runtime = createRuntime();
    prepareRuntime(runtime);
    await resolveLocalContext();
    await validateCompose();
    retireRuntime(runtime, true);
    runtime = undefined;
    console.log("[edge] Static Compose check passed. No image build or container start was requested.");
    return;
  }
  if (action === "up") return up();
  if (action === "down" && !fs.existsSync(activeFile)) {
    console.log("[edge] No active fixture; nothing to remove.");
    return;
  }
  runtime = loadRuntime();
  await resolveLocalContext();
  await validateCompose();
  if (action === "down") return down();
  if (action === "logs") return diagnostics(true);
  if (action === "smoke-private") {
    await verifyTopology();
    await privateSmoke();
    console.log("[edge] Private same-Caddy BFF smoke passed.");
    return;
  }
  await ready();
  if (action === "test") return runTests(false);
  console.log(`[edge] Ready: ${origins(runtime).app}.`);
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Edge command failed.";
  console.error(`[edge] ${redact(message, runtime)}`);
  if (runtime && fs.existsSync(runtimePaths(runtime).state)) {
    if (action === "up" || action === "test") {
      setAdmission(runtime, false);
      runtime.phase = "failed";
      saveRuntime(runtime);
    }
    // Keep the project and diagnostics for investigation. Cleanup is always explicit.
    try { await diagnostics(); } catch { console.error("[edge] Docker diagnostics were unavailable."); }
    if (action === "check") retireRuntime(runtime);
    console.error(`[edge] Sanitized logs: ${runtimePaths(runtime).logs}. Use npm run e2e:edge:down for scoped cleanup.`);
  }
  process.exitCode = 1;
}
