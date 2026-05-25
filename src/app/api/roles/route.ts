import { NextResponse } from "next/server";
import { getRolesRequest } from "@/lib/api";

export async function GET() {
  try {
    const result = await getRolesRequest();
    return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }
}
