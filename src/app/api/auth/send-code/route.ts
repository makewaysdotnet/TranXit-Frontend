import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendVerificationCodeRequest } from "@/lib/api";
import { ApiResult } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<boolean>;

  try {
    result = await sendVerificationCodeRequest(body.email);
  } catch {
    result = demoAuthEnabled
      ? { isSuccess: true, value: true }
      : { isSuccess: false, error: ["Unable to reach local backend"] };
  }

  if (result.isSuccess) {
    const cookieStore = await cookies();
    cookieStore.set("tranxit_reset_email", body.email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
