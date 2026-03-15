export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { requireApiUser } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { authLimiter, getClientKey, rateLimitResponse } from "@/lib/rate-limit";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/validators/auth";

export async function POST(request: NextRequest) {
  const rl = authLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  const { user, profile } = await requireApiUser();
  if (!user || !profile) {
    return apiError("Unauthorized.", 401);
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid payload.");
  }

  const supabase = createSupabaseRouteHandlerClient();

  // Verify current password by attempting a sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.current_password
  });

  if (signInError) {
    return apiError("Current password is incorrect.", 401);
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password
  });

  if (updateError) {
    return apiError(updateError.message ?? "Unable to update password.", 400);
  }

  return apiSuccess({ message: "Password updated successfully." });
}
