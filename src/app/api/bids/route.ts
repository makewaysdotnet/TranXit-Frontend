import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBidRequest } from "@/lib/api";

export async function POST(request: Request) {
  const token = (await cookies()).get("tranxit_session")?.value;
  if (!token) {
    return NextResponse.json(
      { isSuccess: false, error: ["Authentication required"] },
      { status: 401 },
    );
  }

  const body = await request.json();
  let result;
  try {
    result = await createBidRequest(body, token);
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }

  return NextResponse.json(result, { status: result.isSuccess ? 201 : 400 });
}
