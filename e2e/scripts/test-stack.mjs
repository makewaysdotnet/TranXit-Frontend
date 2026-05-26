import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { apiUrl, backendRoot, e2eEnv, projectName } from "./env.mjs";

const action = process.argv[2];
const composeFile = path.join(backendRoot, "docker-compose.test.yml");

process.on("SIGPIPE", () => {
  console.warn("Ignoring Docker Compose SIGPIPE; gateway readiness decides E2E stack success.");
});

if (!["up", "down", "logs", "ready"].includes(action)) {
  console.error("Usage: node e2e/scripts/test-stack.mjs <up|down|logs|ready>");
  process.exit(1);
}

if (!fs.existsSync(composeFile)) {
  console.error(`Missing backend compose file: ${composeFile}`);
  process.exit(1);
}

if (action === "ready") {
  await waitForGateway();
  process.exit(0);
}

const composeArgs =
  action === "up"
    ? [
        "compose",
        "--progress",
        "plain",
        "-p",
        projectName,
        "-f",
        composeFile,
        "up",
        "-d",
        "--build",
      ]
    : [
        "compose",
        "--progress",
        "plain",
        "-p",
        projectName,
        "-f",
        composeFile,
        "down",
        "-v",
        "--remove-orphans",
      ];

if (action === "logs") {
  await dumpComposeDiagnostics();
  process.exit(0);
}

const result = await runDocker(composeArgs);

if (result.status !== 0) {
  await dumpComposeDiagnostics();
  if (action !== "up" || result.status !== 13) {
    process.exit(result.status ?? 1);
  }

  console.warn(
    "docker compose up returned exit 13 after startup; validating gateway readiness before failing.",
  );
}

if (action === "up") {
  await waitForGateway();
}

async function waitForGateway() {
  const deadline = Date.now() + 180_000;
  let lastError = "";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${apiUrl}/api/roles`);
      if (response.ok) {
        console.log(`TranXIT E2E gateway is ready at ${apiUrl}`);
        return;
      }
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  console.error(`Timed out waiting for TranXIT E2E gateway at ${apiUrl}: ${lastError}`);
  await dumpComposeDiagnostics();
  process.exit(1);
}

async function dumpComposeDiagnostics() {
  await runDiagnosticGroup("docker compose ps", [
    "compose",
    "-p",
    projectName,
    "-f",
    composeFile,
    "ps",
    "-a",
  ]);
  await runDiagnosticGroup("docker compose logs", [
    "compose",
    "-p",
    projectName,
    "-f",
    composeFile,
    "logs",
    "--no-color",
    "--tail",
    "200",
  ]);
}

async function runDiagnosticGroup(name, args) {
  const useGroup = process.env.GITHUB_ACTIONS === "true";
  if (useGroup) {
    console.log(`::group::${name}`);
  }

  await runDocker(args, true);

  if (useGroup) {
    console.log("::endgroup::");
  }
}

function runDocker(args) {
  const command = `docker ${args.join(" ")}`;
  console.log(`$ ${command}`);

  return new Promise((resolve) => {
    let settled = false;
    const child = spawn("docker", args, {
      cwd: backendRoot,
      env: e2eEnv(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    const heartbeat = setInterval(() => {
      console.log(`Still running: ${command}`);
    }, 15_000);

    child.stdout.on("data", (chunk) => process.stdout.write(chunk));
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearInterval(heartbeat);
      console.error(`Failed to run ${command}:`, error);
      resolve({ status: 1 });
    });
    child.on("close", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearInterval(heartbeat);
      resolve({ status: code ?? (signal === "SIGPIPE" ? 13 : 1) });
    });
  });
}
