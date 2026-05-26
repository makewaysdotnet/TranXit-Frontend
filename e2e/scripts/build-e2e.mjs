import { spawnSync } from "node:child_process";
import { e2eEnv } from "./env.mjs";

const result = spawnSync("npm", ["run", "build"], {
  env: e2eEnv(),
  shell: true,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
