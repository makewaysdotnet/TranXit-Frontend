import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/auth-session";
import { logoutRequest } from "@/lib/api";
import { ApiResult } from "@/lib/types";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("tranxit_refresh")?.value;
  let result: ApiResult<boolean> = { isSuccess: true, value: true };

  if (refreshToken) {
    try {
      result = await logoutRequest(refreshToken);
    } catch {
      result = {
        isSuccess: false,
        value: false,
        error: ["Unable to revoke the server session"],
      };
    }
  }

  clearAuthCookies(cookieStore);
  return NextResponse.json(result, {
    status: result.isSuccess ? 200 : 502,
  });
}
