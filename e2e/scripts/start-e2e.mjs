import { spawn } from "node:child_process";
import { e2eEnv, frontendPort } from "./env.mjs";

const child = spawn(
  "npx",
  ["next", "start", "--hostname", "127.0.0.1", "--port", frontendPort],
  {
    env: e2eEnv(),
    shell: true,
    stdio: "inherit",
  },
);

function forward(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => forward("SIGINT"));
process.on("SIGTERM", () => forward("SIGTERM"));
child.on("exit", (code) => process.exit(code ?? 0));
