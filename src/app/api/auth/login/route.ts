export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { getDefaultDashboard } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/repositories/userRepository";
import type { Role } from "@/types/domain";
import { loginSchema } from "@/validators/auth";

function resolveRole(profileRole: Role | null | undefined, metadataRole: unknown): Role {
  if (profileRole) {
    return profileRole;
  }

  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  return "patient";
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv) {
    return apiError("Supabase environment variables are not configured.", 500);
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid login payload.");
  }

  const supabase = createSupabaseRouteHandlerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return apiError(error?.message ?? "Unable to sign in.", 401);
  }

  const { data: profile } = await getCurrentUserProfile(supabase, data.user.id);
  const role = resolveRole(profile?.role, data.user.user_metadata?.role);
  const redirectTo = getDefaultDashboard(role);
  const response = apiSuccess({ redirectTo });

  response.cookies.set("sb-role", role, {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });

  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

