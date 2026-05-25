import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getCargoModesRequest,
  getCountriesRequest,
  getCourierModesRequest,
  getDeliveryTypesRequest,
  getItemTypesRequest,
  resultErrors,
} from "@/lib/api";
import { ApiResult, LookupBundle } from "@/lib/types";

export async function GET() {
  const token = (await cookies()).get("tranxit_session")?.value;
  if (!token) {
    return NextResponse.json(
      { isSuccess: false, error: ["Authentication required"] },
      { status: 401 },
    );
  }

  try {
    const [countries, cargoModes, courierModes, itemTypes, deliveryTypes] =
      await Promise.all([
        getCountriesRequest(token),
        getCargoModesRequest(token),
        getCourierModesRequest(token),
        getItemTypesRequest(token),
        getDeliveryTypesRequest(token),
      ]);

    const failed = [countries, cargoModes, courierModes, itemTypes, deliveryTypes]
      .filter((result) => !result.isSuccess)
      .flatMap(resultErrors);

    if (failed.length > 0) {
      return NextResponse.json(
        { isSuccess: false, error: failed },
        { status: 400 },
      );
    }

    const result: ApiResult<LookupBundle> = {
      isSuccess: true,
      value: {
        countries: countries.value || [],
        cargoModes: cargoModes.value || [],
        courierModes: courierModes.value || [],
        itemTypes: itemTypes.value || [],
        deliveryTypes: deliveryTypes.value || [],
      },
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }
}
