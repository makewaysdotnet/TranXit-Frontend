import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCitiesRequest } from "@/lib/api";

type RouteContext = {
  params: Promise<{
    countryId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const token = (await cookies()).get("tranxit_session")?.value;
  if (!token) {
    return NextResponse.json(
      { isSuccess: false, error: ["Authentication required"] },
      { status: 401 },
    );
  }

  const { countryId } = await context.params;
  const parsedCountryId = Number(countryId);
  if (!Number.isInteger(parsedCountryId) || parsedCountryId < 1) {
    return NextResponse.json(
      { isSuccess: false, error: ["Country id is invalid"] },
      { status: 400 },
    );
  }

  try {
    const result = await getCitiesRequest(parsedCountryId, token);
    return NextResponse.json(result, { status: result.isSuccess ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }
}
