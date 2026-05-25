import { ApiResult, LoginResponse } from "./types";

const API_BASE =
  process.env.TRANXIT_API_URL ||
  process.env.NEXT_PUBLIC_TRANXIT_API_URL ||
  "http://localhost:61260";

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResult<T>;

  if (!response.ok) {
    return {
      isSuccess: false,
      error: payload.error || payload.errors || [response.statusText],
    };
  }

  return payload;
}

export function resultErrors<T>(result: ApiResult<T>) {
  return result.error || result.errors || [];
}

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(input: {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone: string;
  roleId?: number;
}) {
  return apiRequest<LoginResponse>("/api/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function sendVerificationCodeRequest(email: string) {
  return apiRequest<boolean>("/api/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCodeRequest(input: { email: string; code: string }) {
  return apiRequest<boolean>("/api/verify-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPasswordRequest(input: {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}) {
  return apiRequest<boolean>("/api/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createJobRequest(input: unknown, token?: string) {
  return apiRequest<{ jobId: number }>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function createBidRequest(input: unknown, token?: string) {
  return apiRequest<{ bidId: number }>("/api/bids", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function updateBidStatusRequest(input: unknown, token?: string) {
  return apiRequest<{ bidId: number }>("/api/bids/status", {
    method: "PUT",
    body: JSON.stringify(input),
    token,
  });
}
