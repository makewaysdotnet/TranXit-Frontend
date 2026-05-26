import { NextResponse } from "next/server";
import { updateBidStatusRequest } from "@/lib/api";
import { apiRequestWithAuthRefresh } from "@/lib/server-auth";

export async function PUT(request: Request) {
  const body = await request.json();
  let result;
  try {
    result = await apiRequestWithAuthRefresh((token) => updateBidStatusRequest(body, token));
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }

  return NextResponse.json(result, { status: result.isSuccess ? 200 : result.status || 400 });
}
