export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { clearEmergencySessionCookie } from "@/lib/emergency-session";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore logout failures from upstream auth when using the emergency session fallback.
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("sb-role");
  clearEmergencySessionCookie(response);
  return response;
}


