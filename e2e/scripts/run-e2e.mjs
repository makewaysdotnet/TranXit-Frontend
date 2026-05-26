import { spawnSync } from "node:child_process";
import { e2eEnv } from "./env.mjs";

const result = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], {
  env: e2eEnv(),
  shell: true,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
