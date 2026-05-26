import { NextResponse } from "next/server";
import {
  getCargoModesRequest,
  getCountriesRequest,
  getCourierModesRequest,
  getDeliveryTypesRequest,
  getItemTypesRequest,
  resultErrors,
} from "@/lib/api";
import { apiRequestWithAuthRefresh } from "@/lib/server-auth";
import { ApiResult, LookupBundle } from "@/lib/types";

export async function GET() {
  try {
    const result = await apiRequestWithAuthRefresh(async (token) => {
      const [countries, cargoModes, courierModes, itemTypes, deliveryTypes] =
        await Promise.all([
          getCountriesRequest(token),
          getCargoModesRequest(token),
          getCourierModesRequest(token),
          getItemTypesRequest(token),
          getDeliveryTypesRequest(token),
        ]);

      const failed = [countries, cargoModes, courierModes, itemTypes, deliveryTypes]
        .filter((lookupResult) => !lookupResult.isSuccess)
        .flatMap(resultErrors);

      if (failed.length > 0) {
        return {
          isSuccess: false,
          error: failed,
          status: [countries, cargoModes, courierModes, itemTypes, deliveryTypes]
            .find((lookupResult) => lookupResult.status === 401)?.status || 400,
        };
      }

      return {
        isSuccess: true,
        value: {
          countries: countries.value || [],
          cargoModes: cargoModes.value || [],
          courierModes: courierModes.value || [],
          itemTypes: itemTypes.value || [],
          deliveryTypes: deliveryTypes.value || [],
        },
      } satisfies ApiResult<LookupBundle>;
    });

    return NextResponse.json(result, { status: result.isSuccess ? 200 : result.status || 400 });
  } catch {
    return NextResponse.json(
      { isSuccess: false, error: ["Unable to reach local backend"] },
      { status: 502 },
    );
  }
}
