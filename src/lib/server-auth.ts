import { cookies } from "next/headers";

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tranxit_session")?.value;
  const role = cookieStore.get("tranxit_role")?.value;
  const userId = Number(cookieStore.get("tranxit_user_id")?.value);

  return {
    token,
    role,
    userId: Number.isInteger(userId) && userId > 0 ? userId : null,
  };
}
