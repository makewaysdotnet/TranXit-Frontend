import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { apiUrl, backendRoot, e2eEnv, projectName } from "./env.mjs";

const action = process.argv[2];
const composeFile = path.join(backendRoot, "docker-compose.test.yml");

if (!["up", "down"].includes(action)) {
  console.error("Usage: node e2e/scripts/test-stack.mjs <up|down>");
  process.exit(1);
}

if (!fs.existsSync(composeFile)) {
  console.error(`Missing backend compose file: ${composeFile}`);
  process.exit(1);
}

const composeArgs =
  action === "up"
    ? ["compose", "-p", projectName, "-f", composeFile, "up", "-d", "--build", "--force-recreate"]
    : ["compose", "-p", projectName, "-f", composeFile, "down", "-v", "--remove-orphans"];

const result = spawnSync("docker", composeArgs, {
  cwd: backendRoot,
  env: e2eEnv(),
  shell: true,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
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
  process.exit(1);
}
