import { cookies } from "next/headers";
import { LoginResponse } from "./types";

export const authCookieNames = [
  "tranxit_session",
  "tranxit_refresh",
  "tranxit_role",
  "tranxit_user_id",
  "tranxit_user_name",
  "tranxit_pending_email",
  "tranxit_pending_role",
  "tranxit_dev_verification_code",
];

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const secure = process.env.NODE_ENV === "production";

function maxAgeFrom(value: string | undefined | null, fallbackSeconds: number) {
  if (!value) {
    return fallbackSeconds;
  }

  const expiresAt = Date.parse(value);
  if (Number.isNaN(expiresAt)) {
    return fallbackSeconds;
  }

  return Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
}

export function clearAuthCookies(cookieStore: CookieStore) {
  for (const name of authCookieNames) {
    cookieStore.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  }
}

export function setAuthenticatedCookies(cookieStore: CookieStore, auth: LoginResponse) {
  const token = auth.token;
  const role = auth.role;

  if (!token || !role) {
    return;
  }

  const refreshMaxAge = auth.refreshToken
    ? maxAgeFrom(auth.refreshTokenExpires, 60 * 60 * 24 * 14)
    : maxAgeFrom(auth.expires, 60 * 60);

  cookieStore.set("tranxit_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshMaxAge,
  });
  cookieStore.set("tranxit_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshMaxAge,
  });
  cookieStore.set("tranxit_user_id", String(auth.id), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshMaxAge,
  });
  cookieStore.set("tranxit_user_name", encodeURIComponent(auth.name || auth.email), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshMaxAge,
  });

  if (auth.refreshToken) {
    cookieStore.set("tranxit_refresh", auth.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: refreshMaxAge,
    });
  }
}
