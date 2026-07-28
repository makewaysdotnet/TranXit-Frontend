import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerRequest } from "@/lib/api";
import {
  clearAuthCookies,
  setPendingVerificationCookies,
} from "@/lib/auth-session";
import { toPublicAuthResult } from "@/lib/public-auth";
import { ApiResult, LoginResponse } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";
const productionDeployment = process.env.TRANXIT_DEPLOY_ENV === "production";
const exposeDevelopmentCode =
  !productionDeployment &&
  (process.env.NODE_ENV !== "production" || process.env.TRANXIT_E2E_EXPOSE_DEV_CODE === "true");

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<LoginResponse>;
  const requestedRole =
    body.role === "Courier" ? "Courier" : body.role === "Customer" ? "Customer" : null;

  if (!requestedRole) {
    return NextResponse.json(
      { isSuccess: false, error: ["Choose Customer or Courier"] },
      { status: 400 },
    );
  }

  try {
    result = await registerRequest(body);
  } catch {
    if (demoAuthEnabled) {
      result = {
        isSuccess: true,
        value: {
          id: 0,
          name: body.username,
          email: body.email,
          role: requestedRole,
          isEmailVerified: false,
        },
      };
    } else {
      result = { isSuccess: false, error: ["Unable to reach local backend"] };
    }
  }

  if (result.isSuccess && result.value) {
    const cookieStore = await cookies();
    const role = result.value.role;
    if (!role) {
      return NextResponse.json(
        { isSuccess: false, error: ["Role was not returned"] },
        { status: 400 },
      );
    }

    clearAuthCookies(cookieStore);

    setPendingVerificationCookies(
      cookieStore,
      {
        email: result.value.email || body.email,
        role,
      },
      exposeDevelopmentCode
        ? result.value.developmentVerificationCode
        : undefined,
    );
  }

  return NextResponse.json(toPublicAuthResult(result), {
    status: result.isSuccess ? 200 : 400,
  });
}
