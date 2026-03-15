import { NextRequest } from "next/server";

import { createAuditLog, fireAndForget } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { hasSupabaseEnv } from "@/lib/env";
import { authLimiter, getClientKey, rateLimitResponse } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/validators/auth";

export async function POST(request: NextRequest) {
  const rl = authLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  if (!hasSupabaseEnv) {
    return apiError("Supabase environment variables are not configured.", 500);
  }

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid signup payload.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: parsed.data.role
    }
  });

  if (error || !data.user) {
    return apiError(error?.message ?? "Unable to create account.", 400);
  }

  const userId = data.user.id;

  // Upsert user row first (role table depends on it via FK)
  const userUpsert = await (supabase.from("users") as any).upsert(
    {
      id: userId,
      email: parsed.data.email,
      role: parsed.data.role,
      full_name: null,
      organization_id: null,
      avatar_url: null
    },
    { onConflict: "id" }
  );

  if (userUpsert.error) {
    await supabase.auth.admin.deleteUser(userId);
    return apiError(userUpsert.error.message, 400);
  }

  // Role-specific upsert (only one runs)
  const roleUpsert =
    parsed.data.role === "patient"
      ? await (supabase.from("patients") as any).upsert({ user_id: userId }, { onConflict: "user_id" })
      : parsed.data.role === "provider"
        ? await (supabase.from("providers") as any).upsert({ user_id: userId, organization_id: null }, { onConflict: "user_id" })
        : null;

  if (roleUpsert?.error) {
    await supabase.auth.admin.deleteUser(userId);
    return apiError(roleUpsert.error.message, 400);
  }

  fireAndForget(
    createAuditLog("user.signup", "users", userId, { email: parsed.data.email, role: parsed.data.role }, userId)
  );

  return apiSuccess({ user: userId, role: parsed.data.role }, { status: 201 });
}
