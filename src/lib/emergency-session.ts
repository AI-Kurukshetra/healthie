import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import type { Role } from "@/types/domain";

export const emergencySessionCookieName = "hp-emergency-session";

export type EmergencySession = {
  userId: string;
  email: string;
  role: Role;
};

function isRole(value: unknown): value is Role {
  return value === "patient" || value === "provider" || value === "admin";
}

function parseCookieValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<EmergencySession>;

    if (
      typeof parsed.userId === "string" &&
      typeof parsed.email === "string" &&
      isRole(parsed.role)
    ) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        role: parsed.role
      } satisfies EmergencySession;
    }
  } catch {
    return null;
  }

  return null;
}

export function canUseEmergencySession(hostname?: string) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function readEmergencySession() {
  return parseCookieValue(cookies().get(emergencySessionCookieName)?.value);
}

export function readEmergencySessionFromRequest(request: NextRequest) {
  return parseCookieValue(request.cookies.get(emergencySessionCookieName)?.value);
}

export function setEmergencySessionCookie(response: NextResponse, session: EmergencySession) {
  response.cookies.set(emergencySessionCookieName, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    path: "/",
    sameSite: "lax"
  });
}

export function clearEmergencySessionCookie(response: NextResponse) {
  response.cookies.delete(emergencySessionCookieName);
}
