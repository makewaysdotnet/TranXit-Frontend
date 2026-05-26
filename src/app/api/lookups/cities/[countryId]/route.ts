import { NextResponse } from "next/server";
import { getCitiesRequest } from "@/lib/api";
import { apiRequestWithAuthRefresh } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{
    countryId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { countryId } = await context.params;
  const parsedCountryId = Number(countryId);
  if (!Number.isInteger(parsedCountryId) || parsedCountryId < 1) {
    return NextResponse.json(
      { isSuccess: false, error: ["Country id is invalid"] },
      { status: 400 },
    );
  }

  try {
    const result = await apiRequestWithAuthRefresh((token) =>
      getCitiesRequest(parsedCountryId, token),
    );
    return NextResponse.json(result, { status: result.isSuccess ? 200 : result.status || 400 });
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }
}
