import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyEmailCodeRequest } from "@/lib/api";
import { ApiResult } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<boolean>;

  try {
    result = await verifyEmailCodeRequest({
      email: body.email,
      code: body.code,
    });
  } catch {
    result =
      demoAuthEnabled && body.code === "000000"
        ? { isSuccess: true, value: true }
        : { isSuccess: false, error: ["Unable to reach local backend"] };
  }

  if (result.isSuccess) {
    const cookieStore = await cookies();
    cookieStore.delete("tranxit_pending_email");
    cookieStore.delete("tranxit_pending_role");
    cookieStore.delete("tranxit_dev_verification_code");
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
