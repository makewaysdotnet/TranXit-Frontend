import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginRequest } from "@/lib/api";
import { ApiResult, LoginResponse } from "@/lib/types";

const demoAuthEnabled = process.env.TRANXIT_ENABLE_DEMO_AUTH === "true";

const demoUsers: Record<string, LoginResponse> = {
  "customer@tranxit.local": {
    id: 1,
    name: "Ayesha Khan",
    email: "customer@tranxit.local",
    role: "Customer",
    token: "demo-customer-token",
    isEmailVerified: true,
  },
  "courier@tranxit.local": {
    id: 2,
    name: "TranXIT Courier Co.",
    email: "courier@tranxit.local",
    role: "Courier",
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
    if (demoAuthEnabled) {
      const demo = demoUsers[String(body.email).toLowerCase()];
      result =
        demo && body.password === "Password1!"
          ? { isSuccess: true, value: demo }
          : { isSuccess: false, error: ["Unable to reach local backend"] };
    } else {
      result = { isSuccess: false, error: ["Unable to reach local backend"] };
    }
  }

  if (!result.isSuccess || !result.value) {
    return NextResponse.json(result, { status: 400 });
  }

  const token = result.value.token;
  if (!token) {
    return NextResponse.json(
      { isSuccess: false, error: ["Authentication token was not returned"] },
      { status: 400 },
    );
  }

  const role = result.value.role;
  if (!role) {
    return NextResponse.json(
      { isSuccess: false, error: ["Role was not returned"] },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set("tranxit_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set("tranxit_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set("tranxit_user_id", String(result.value.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json(result);
}
