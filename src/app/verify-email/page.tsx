import { cookies } from "next/headers";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();
  const pendingEmail = cookieStore.get("tranxit_pending_email")?.value || "";
  const productionDeployment = process.env.TRANXIT_DEPLOY_ENV === "production";
  const developmentCode =
    process.env.NODE_ENV === "production" || productionDeployment
      ? ""
      : cookieStore.get("tranxit_dev_verification_code")?.value || "";

  return <VerifyEmailPanel initialEmail={pendingEmail} developmentCode={developmentCode} />;
}
