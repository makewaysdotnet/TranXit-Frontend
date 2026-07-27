import { ApiResult, LoginResponse, PublicLoginResponse } from "./types";

export function toPublicLoginResponse(auth: LoginResponse): PublicLoginResponse {
  return {
    id: auth.id,
    name: auth.name,
    email: auth.email,
    role: auth.role,
    roleId: auth.roleId,
    isEmailVerified: auth.isEmailVerified,
  };
}

export function toPublicAuthResult(
  result: ApiResult<LoginResponse>,
): ApiResult<PublicLoginResponse> {
  return {
    isSuccess: result.isSuccess,
    value: result.value ? toPublicLoginResponse(result.value) : undefined,
    error: result.error,
    errors: result.errors,
    status: result.status,
  };
}
