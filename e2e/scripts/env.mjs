import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const frontendRoot = path.resolve(scriptDir, "../..");
export const backendRoot = process.env.TRANXIT_BACKEND_DIR
  ? path.resolve(process.env.TRANXIT_BACKEND_DIR)
  : path.resolve(frontendRoot, "..", "TranXIT-Backend", "TranXit");

export const frontendPort = process.env.TRANXIT_E2E_FRONTEND_PORT || "3100";
export const gatewayPort = process.env.TRANXIT_E2E_GATEWAY_PORT || "18188";
export const sqlPort = process.env.TRANXIT_E2E_SQL_PORT || "11488";
export const rabbitmqPort = process.env.TRANXIT_E2E_RABBITMQ_PORT || "25688";
export const rabbitmqManagementPort =
  process.env.TRANXIT_E2E_RABBITMQ_MANAGEMENT_PORT || "25689";
export const projectName = process.env.TRANXIT_E2E_PROJECT_NAME || "tranxit-e2e";

export const baseUrl =
  process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${frontendPort}`;
export const apiUrl =
  process.env.TRANXIT_API_URL ||
  process.env.NEXT_PUBLIC_TRANXIT_API_URL ||
  `http://127.0.0.1:${gatewayPort}`;

export function e2eEnv(overrides = {}) {
  return {
    ...process.env,
    PLAYWRIGHT_BASE_URL: baseUrl,
    NEXT_PUBLIC_TRANXIT_API_URL: apiUrl,
    TRANXIT_API_URL: apiUrl,
    TRANXIT_E2E_FRONTEND_PORT: frontendPort,
    TRANXIT_E2E_GATEWAY_PORT: gatewayPort,
    TRANXIT_E2E_SQL_PORT: sqlPort,
    TRANXIT_E2E_RABBITMQ_PORT: rabbitmqPort,
    TRANXIT_E2E_RABBITMQ_MANAGEMENT_PORT: rabbitmqManagementPort,
    TRANXIT_E2E_PROJECT_NAME: projectName,
    TRANXIT_E2E_EXPOSE_DEV_CODE: process.env.TRANXIT_E2E_EXPOSE_DEV_CODE || "true",
    TRANXIT_E2E_SA_PASSWORD:
      process.env.TRANXIT_E2E_SA_PASSWORD || "TranXIT_E2E_Test_2026!",
    TRANXIT_E2E_JWT_SECRET:
      process.env.TRANXIT_E2E_JWT_SECRET ||
      "TranXIT.e2e.jwt.signing.key.local.2026",
    TRANXIT_E2E_RABBITMQ_USERNAME:
      process.env.TRANXIT_E2E_RABBITMQ_USERNAME || "tranxit_e2e",
    TRANXIT_E2E_RABBITMQ_PASSWORD:
      process.env.TRANXIT_E2E_RABBITMQ_PASSWORD || "TranXIT_E2E_Rabbit_2026!",
    ...overrides,
  };
}
