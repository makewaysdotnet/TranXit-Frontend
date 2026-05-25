import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerRequest } from "@/lib/api";
import { ApiResult, LoginResponse } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<LoginResponse>;

  try {
    result = await registerRequest(body);
  } catch {
    if (demoAuthEnabled) {
      result = {
        isSuccess: true,
        value: {
          id: body.roleId === 2 ? 2 : 1,
          name: body.username,
          email: body.email,
          role: body.roleId === 2 ? "Courier" : "Customer",
          roleId: body.roleId,
          isEmailVerified: false,
        },
      };
    } else {
      result = { isSuccess: false, error: ["Unable to reach local backend"] };
    }
  }

  if (result.isSuccess && result.value) {
    const cookieStore = await cookies();
    const role =
      result.value.role || (result.value.roleId === 2 ? "Courier" : "Customer");
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
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
