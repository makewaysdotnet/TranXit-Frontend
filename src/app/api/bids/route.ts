import { NextResponse } from "next/server";
import { createBidRequest } from "@/lib/api";
import { apiRequestWithAuthRefresh } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json();
  let result;
  try {
    result = await apiRequestWithAuthRefresh((token) => createBidRequest(body, token));
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }

  return NextResponse.json(result, { status: result.isSuccess ? 201 : result.status || 400 });
}
