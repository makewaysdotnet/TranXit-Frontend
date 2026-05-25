import { AuthPanel } from "@/components/auth/auth-panel";

export default function LoginPage() {
  return (
    <AuthPanel
      mode="login"
      demoAuthEnabled={process.env.TRANXIT_ENABLE_DEMO_AUTH === "true"}
    />
  );
}
