import { SetupBanner } from "@/components/layout/setup-banner";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { hasSupabaseEnv } from "@/lib/env";

export default function SignupPage() {
  return (
    <AuthLayout
      description="Create a workspace account and explore the new patient, provider, and administrative experiences built for this platform."
      kicker="Get started"
      title="Create your healthcare platform account"
    >
      {!hasSupabaseEnv ? <SetupBanner /> : <SignupForm />}
    </AuthLayout>
  );
}
