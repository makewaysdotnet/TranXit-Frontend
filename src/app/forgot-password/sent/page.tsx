import { cookies } from "next/headers";
import { ResetCodeSentPanel } from "@/components/auth/password-reset-panels";

export default async function ForgotPasswordSentPage() {
  const cookieStore = await cookies();
  const resetEmail = cookieStore.get("tranxit_reset_email")?.value || "";

  return <ResetCodeSentPanel email={resetEmail} />;
}
