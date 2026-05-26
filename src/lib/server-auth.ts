import { cookies } from "next/headers";
import { refreshRequest } from "./api";
import { clearAuthCookies, setAuthenticatedCookies } from "./auth-session";
import { ApiResult } from "./types";

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tranxit_session")?.value;
  const role = cookieStore.get("tranxit_role")?.value;
  const userId = Number(cookieStore.get("tranxit_user_id")?.value);
  const encodedUserName = cookieStore.get("tranxit_user_name")?.value;
  const userName = encodedUserName ? decodeURIComponent(encodedUserName) : null;

  return {
    token,
    role,
    userId: Number.isInteger(userId) && userId > 0 ? userId : null,
    userName,
  };
}

export async function apiRequestWithAuthRefresh<T>(
  request: (token: string) => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("tranxit_refresh")?.value;
  const currentToken = cookieStore.get("tranxit_session")?.value;

  if (currentToken) {
    const result = await request(currentToken);
    if (result.status !== 401) {
      return result;
    }
  }

  if (!refreshToken) {
    return {
      isSuccess: false,
      error: ["Authentication required"],
      status: 401,
    };
  }

  const refreshed = await refreshRequest(refreshToken);
  if (!refreshed.isSuccess || !refreshed.value?.token || !refreshed.value.refreshToken) {
    clearAuthCookies(cookieStore);
    return {
      isSuccess: false,
      error: refreshed.error || refreshed.errors || ["Session expired"],
      status: 401,
    };
  }

  setAuthenticatedCookies(cookieStore, refreshed.value);
  return request(refreshed.value.token);
}
