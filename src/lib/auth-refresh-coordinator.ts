import { createHash } from "node:crypto";
import type { ApiResult, LoginResponse } from "./types";

// Coalesce only requests which overlap in this Node process. There is deliberately
// no completed-result grace period: a later replay must reach the backend's
// refresh-family reuse detection. Multiple replicas need shared coordination.
export function createRefreshCoordinator<T>(maxInFlight = 256) {
  const pending = new Map<string, Promise<T>>();
  return (refreshToken: string, rotate: () => Promise<T>): Promise<T> => {
    const key = createHash("sha256").update(refreshToken).digest("hex");
    const existing = pending.get(key);
    if (existing) return existing;
    if (pending.size >= maxInFlight) {
      return Promise.reject(new Error("Session renewal is busy. Retry shortly."));
    }
    const operation = Promise.resolve().then(rotate).finally(() => pending.delete(key));
    pending.set(key, operation);
    return operation;
  };
}

// App Router route bundles can evaluate modules separately. Share the coordinator
// in this process so explicit /auth/refresh and automatic BFF retries meet here.
const authGlobal = globalThis as typeof globalThis & {
  tranxitRefreshCoordinator?: ReturnType<typeof createRefreshCoordinator<ApiResult<LoginResponse>>>;
};
export const coordinateAuthRefresh = authGlobal.tranxitRefreshCoordinator ??=
  createRefreshCoordinator<ApiResult<LoginResponse>>();
