import { AuthPanel } from "@/components/auth/auth-panel";

export default function RegisterPage() {
  return (
    <AuthPanel
      mode="register"
      demoAuthEnabled={process.env.TRANXIT_ENABLE_DEMO_AUTH === "true"}
    />
  );
}
