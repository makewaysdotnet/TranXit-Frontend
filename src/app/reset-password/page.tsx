import { cookies } from "next/headers";
import { ResetPasswordPanel } from "@/components/auth/password-reset-panels";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const resetEmail = cookieStore.get("tranxit_reset_email")?.value || "";

  return <ResetPasswordPanel initialEmail={resetEmail} />;
}
