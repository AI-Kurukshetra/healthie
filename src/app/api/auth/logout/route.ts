export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { createAuditLog, fireAndForget } from "@/app/api/_utils/helpers";
import { clearEmergencySessionCookie } from "@/lib/emergency-session";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let userId: string | null = null;

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
    await supabase.auth.signOut();
  } catch {
    // Ignore logout failures from upstream auth when using the emergency session fallback.
  }

  if (userId) {
    fireAndForget(createAuditLog("user.logout", "users", userId, {}, userId));
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("sb-role");
  clearEmergencySessionCookie(response);
  return response;
}


