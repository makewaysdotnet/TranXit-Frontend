import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginRequest } from "@/lib/api";
import { ApiResult, LoginResponse } from "@/lib/types";

const demoUsers: Record<string, LoginResponse> = {
  "customer@tranxit.local": {
    id: 1,
    name: "Ayesha Khan",
    email: "customer@tranxit.local",
    role: "Customer",
    roleId: 1,
    token: "demo-customer-token",
    isEmailVerified: true,
  },
  "courier@tranxit.local": {
    id: 2,
    name: "TranXIT Courier Co.",
    email: "courier@tranxit.local",
    role: "Courier",
    roleId: 2,
    token: "demo-courier-token",
    isEmailVerified: true,
  },
};

export async function POST(request: Request) {
  const body = await request.json();
  let result: ApiResult<LoginResponse>;

  try {
    result = await loginRequest(body.email, body.password);
  } catch {
    const demo = demoUsers[String(body.email).toLowerCase()];
    result =
      demo && body.password === "Password1!"
        ? { isSuccess: true, value: demo }
        : { isSuccess: false, error: ["Unable to reach local backend"] };
  }

  if (!result.isSuccess || !result.value) {
    return NextResponse.json(result, { status: 400 });
  }

  const token = result.value.token || "demo-token";
  const cookieStore = await cookies();

  cookieStore.set("tranxit_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set("tranxit_role", result.value.role || "Customer", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json(result);
}
