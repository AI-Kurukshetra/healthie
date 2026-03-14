import { SetupBanner } from "@/components/layout/setup-banner";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  return (
    <AuthLayout
      description="Access the patient portal, provider operations workspace, or admin controls through the redesigned healthcare UI system."
      kicker="Secure access"
      title="Welcome back to your care workspace"
    >
      {!hasSupabaseEnv ? <SetupBanner /> : <LoginForm />}
    </AuthLayout>
  );
}
