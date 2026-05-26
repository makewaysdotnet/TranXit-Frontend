import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerRequest } from "@/lib/api";
import { ApiResult, LoginResponse } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";
const exposeDevelopmentCode =
  process.env.NODE_ENV !== "production" || process.env.TRANXIT_E2E_EXPOSE_DEV_CODE === "true";
const authCookieNames = [
  "tranxit_session",
  "tranxit_role",
  "tranxit_user_id",
  "tranxit_user_name",
  "tranxit_pending_email",
  "tranxit_pending_role",
  "tranxit_dev_verification_code",
];

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

    for (const name of authCookieNames) {
      cookieStore.set(name, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
    }

    cookieStore.set("tranxit_pending_email", result.value.email || body.email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });
    cookieStore.set("tranxit_pending_role", role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });
    if (result.value.developmentVerificationCode && exposeDevelopmentCode) {
      cookieStore.set(
        "tranxit_dev_verification_code",
        result.value.developmentVerificationCode,
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 30,
        },
      );
    }
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
