import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import {
  canUseEmergencySession,
  readEmergencySessionFromRequest
} from "@/lib/emergency-session";
import { getDefaultDashboard } from "@/lib/auth";
import type { Database } from "@/types/database";
import type { Role } from "@/types/domain";

const protectedPrefixes = ["/patient", "/provider", "/admin"] as const;
const authPages = ["/login", "/signup"];
const roleAllowedPrefixes: Record<Role, string[]> = {
  patient: ["/patient"],
  provider: ["/provider"],
  admin: ["/admin", "/patient", "/provider"]
};

function resolveRole(metadataRole: unknown, cookieRole: string | undefined): Role | null {
  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  if (cookieRole === "patient" || cookieRole === "provider" || cookieRole === "admin") {
    return cookieRole;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matchedProtectedPrefix = protectedPrefixes.find((prefix) => pathname.startsWith(prefix));
  const isAuthPage = authPages.includes(pathname);
  const emergencySession =
    canUseEmergencySession(request.nextUrl.hostname) ? readEmergencySessionFromRequest(request) : null;

  if (emergencySession) {
    const role = emergencySession.role;

    if (matchedProtectedPrefix) {
      const allowedPrefixes = roleAllowedPrefixes[role];
      const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isAllowed) {
        return NextResponse.redirect(new URL(getDefaultDashboard(role), request.url));
      }
    }

    if (isAuthPage) {
      return NextResponse.redirect(new URL(getDefaultDashboard(role), request.url));
    }

    return NextResponse.next();
  }

  if (!matchedProtectedPrefix && !isAuthPage) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const role = resolveRole(user?.user_metadata.role, request.cookies.get("sb-role")?.value);

  if (matchedProtectedPrefix && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && user && role) {
    return NextResponse.redirect(new URL(getDefaultDashboard(role), request.url));
  }

  if (matchedProtectedPrefix && role) {
    const allowedPrefixes = roleAllowedPrefixes[role];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!isAllowed) {
      return NextResponse.redirect(new URL(getDefaultDashboard(role), request.url));
    }
  }

  if (role) {
    response.cookies.set("sb-role", role, {
      httpOnly: false,
      path: "/",
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
