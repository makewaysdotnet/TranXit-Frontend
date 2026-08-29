import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import edgeEnvironment from "./edge-env.cjs";

const { activeFile, frontendRoot, loadRuntime, redact, runtimePaths } = edgeEnvironment;
const stack = fileURLToPath(new URL("./edge-stack.mjs", import.meta.url));

function run(args, extraEnv = {}) {
  return spawnSync(process.execPath, [stack, ...args], {
    cwd: frontendRoot,
    encoding: "utf8",
    timeout: 900_000,
    windowsHide: true,
    env: { ...process.env, ...extraEnv },
  });
}

assert.equal(fs.existsSync(activeFile), false, "Remove the active edge fixture before the credibility check.");
const red = run(["up"], { TRANXIT_EDGE_CREDIBILITY_MUTATION: "strip-admission-imports" });
assert.ok(fs.existsSync(activeFile), "The red fixture did not retain evidence for review.");
const runtime = loadRuntime();
const output = redact(`${red.stdout}\n${red.stderr}`, runtime);
const evidence = runtimePaths(runtime);
fs.writeFileSync(path.join(evidence.results, "credibility-red.log"), output, { mode: 0o600 });

let failure;
try {
  assert.notEqual(red.status, 0, "Admission-import removal unexpectedly passed fixture startup.");
  assert.match(output, /Public admission expected 503, received 200\./,
    "Credibility mutation failed for a reason other than bypassing closed admission.");
  assert.ok(fs.existsSync(path.join(evidence.results, "credibility.diff")), "Missing credibility diff.");
  console.log("RED T-E2E-EDGE.ProductionAdmission: private production-Caddy copy returned 200 while admission was closed.");
  console.log(`Evidence: ${evidence.results}`);
} catch (error) {
  failure = error;
} finally {
  const down = run(["down"]);
  if (down.status !== 0) {
    failure ??= new Error(`Credibility fixture cleanup failed: ${redact(`${down.stdout}\n${down.stderr}`, runtime)}`);
  }
}

if (failure) throw failure;
