import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resetPasswordRequest } from "@/lib/api";
import { ApiResult } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<boolean>;

  try {
    result = await resetPasswordRequest({
      email: body.email,
      code: body.code,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });
  } catch {
    result =
      demoAuthEnabled && body.code === "000000"
        ? { isSuccess: true, value: true }
        : { isSuccess: false, error: ["Unable to reach local backend"] };
  }

  if (result.isSuccess) {
    const cookieStore = await cookies();
    cookieStore.delete("tranxit_reset_email");
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
