import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
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
        "--force-recreate",
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

const result = await runDocker(composeArgs);

if (result.status !== 0 && action !== "up") {
  process.exit(result.status ?? 1);
}

if (result.status !== 0) {
  console.warn(
    `docker compose up returned ${result.status}; continuing to gateway readiness probe before failing.`,
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
  await runDocker(["compose", "-p", projectName, "-f", composeFile, "ps"], true);
  await runDocker(["compose", "-p", projectName, "-f", composeFile, "logs", "--tail", "120"], true);
}

function runDocker(args, alwaysPrint = false) {
	const command = `docker ${args.join(" ")}`;
	return new Promise((resolve) => {
		let stdout = "";
		let stderr = "";
		const maxBufferedOutput = 1024 * 1024 * 8;
		const child = spawn("docker", args, {
			cwd: backendRoot,
			env: e2eEnv(),
		});

		const heartbeat = setInterval(() => {
			console.log(`Still running: ${command}`);
		}, 20_000);

		child.stdout.on("data", (chunk) => {
			const text = chunk.toString();
			if (alwaysPrint) {
				process.stdout.write(text);
				return;
			}
			stdout = (stdout + text).slice(-maxBufferedOutput);
		});

		child.stderr.on("data", (chunk) => {
			const text = chunk.toString();
			if (alwaysPrint) {
				process.stderr.write(text);
				return;
			}
			stderr = (stderr + text).slice(-maxBufferedOutput);
		});

		child.on("error", (error) => {
			clearInterval(heartbeat);
			console.error(`Failed to run ${command}:`, error);
			resolve({ status: 1 });
		});

		child.on("close", (code, signal) => {
			clearInterval(heartbeat);
			const status = code ?? (signal === "SIGPIPE" ? 13 : 1);
			if (alwaysPrint || status !== 0) {
				console.log(`$ ${command}`);
				if (stdout) {
					console.log(stdout);
				}
				if (stderr) {
					console.error(stderr);
				}
			}
			resolve({ status });
		});
	});
}
