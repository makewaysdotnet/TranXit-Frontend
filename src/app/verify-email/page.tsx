import { cookies } from "next/headers";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get("tranxit_pending_email")?.value || "";

  return <VerifyEmailPanel initialEmail={pendingEmail} />;
}
