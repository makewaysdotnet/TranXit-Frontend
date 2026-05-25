import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateBidStatusRequest } from "@/lib/api";

export async function PUT(request: Request) {
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
    result = await updateBidStatusRequest(body, token);
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
}
