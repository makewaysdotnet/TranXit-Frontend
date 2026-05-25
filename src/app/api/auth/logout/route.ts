import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("tranxit_session");
  cookieStore.delete("tranxit_role");
  cookieStore.delete("tranxit_user_id");
  cookieStore.delete("tranxit_pending_email");
  cookieStore.delete("tranxit_pending_role");
  cookieStore.delete("tranxit_dev_verification_code");
  return NextResponse.json({ ok: true });
}
