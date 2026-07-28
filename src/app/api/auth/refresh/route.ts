import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshRequest } from "@/lib/api";
import { clearAuthCookies, setAuthenticatedCookies } from "@/lib/auth-session";
import { toPublicAuthResult } from "@/lib/public-auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("tranxit_refresh")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { isSuccess: false, error: ["Refresh token is required"] },
      { status: 401 },
    );
  }

  let result;
  try {
    result = await refreshRequest(refreshToken);
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }

  if (!result.isSuccess || !result.value?.token || !result.value.refreshToken) {
    clearAuthCookies(cookieStore);
    return NextResponse.json(toPublicAuthResult(result), { status: 401 });
  }

  setAuthenticatedCookies(cookieStore, result.value);
  return NextResponse.json(toPublicAuthResult(result));
}
