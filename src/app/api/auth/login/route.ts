export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { createAuditLog, fireAndForget } from "@/app/api/_utils/helpers";
import { apiError, apiSuccess } from "@/lib/api";
import { getDefaultDashboard } from "@/lib/auth";
import {
  canUseEmergencySession,
  setEmergencySessionCookie
} from "@/lib/emergency-session";
import { hasSupabaseEnv } from "@/lib/env";
import { authLimiter, getClientKey, rateLimitResponse } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";
import { loginSchema } from "@/validators/auth";

function normalizeAuthError(error: unknown, status: number) {
  if (error && typeof error === "object") {
    const message = "message" in error ? error.message : null;

    if (typeof message === "string") {
      const trimmed = message.trim();

      if (trimmed && trimmed !== "{}" && trimmed !== "[object Object]") {
        return trimmed;
      }
    }
  }

  if (status === 504) {
    return "Supabase Auth timed out while verifying your credentials.";
  }

  if (status === 401 || status === 400) {
    return "Invalid email or password.";
  }

  return "Unable to sign in.";
}

async function signInWithTimeout(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  credentials: { email: string; password: string },
  timeoutMs = 8000
) {
  const timeoutResult = new Promise<{
    data: null;
    error: { status: number; name: string; message: string };
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        data: null,
        error: {
          status: 504,
          name: "AuthTimeoutError",
          message: "Supabase Auth timed out while verifying your credentials."
        }
      });
    }, timeoutMs);
  });

  return Promise.race([
    supabase.auth.signInWithPassword(credentials),
    timeoutResult
  ]);
}

function resolveRole(metadataRole: unknown): Role {
  if (metadataRole === "patient" || metadataRole === "provider" || metadataRole === "admin") {
    return metadataRole;
  }

  return "patient";
}

export async function POST(request: NextRequest) {
  const rl = authLimiter.check(getClientKey(request));
  if (!rl.allowed) return rateLimitResponse(rl);

  if (!hasSupabaseEnv) {
    return apiError("Supabase environment variables are not configured.", 500);
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid login payload.");
  }

  const supabase = createSupabaseRouteHandlerClient();
  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"] | null = null;
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"] | null = null;

  try {
    const result = await signInWithTimeout(supabase, parsed.data);
    data = result.data;
    error = result.error;
  } catch (caughtError) {
    console.error("[api/auth/login] signInWithPassword threw", caughtError);
    return apiError("Supabase Auth timed out while verifying your credentials.", 504);
  }

  if (error || !data.user) {
    const status =
      typeof error?.status === "number" && error.status >= 400 ? error.status : 401;

    console.error("[api/auth/login] signInWithPassword failed", {
      status,
      name: error?.name ?? null,
      message: error?.message ?? null
    });

    if (status === 504 && canUseEmergencySession(request.nextUrl.hostname)) {
      const admin = createSupabaseAdminClient();
      const userLookup = await (admin.from("users") as any)
        .select("id, email, role")
        .eq("email", parsed.data.email)
        .maybeSingle();
      const fallbackUser = userLookup.data as { id: string; email: string; role: Role } | null;

      if (fallbackUser) {
        console.warn("[api/auth/login] using localhost emergency session fallback", {
          userId: fallbackUser.id,
          role: fallbackUser.role
        });

        const redirectTo = getDefaultDashboard(fallbackUser.role);
        const response = apiSuccess({ redirectTo, emergency: true });
        response.cookies.set("sb-role", fallbackUser.role, {
          httpOnly: false,
          path: "/",
          sameSite: "lax"
        });
        setEmergencySessionCookie(response, {
          userId: fallbackUser.id,
          email: fallbackUser.email,
          role: fallbackUser.role
        });

        return response;
      }
    }

    fireAndForget(
      createAuditLog("user.login_failed", "users", null, { email: parsed.data.email, status })
    );

    return apiError(normalizeAuthError(error, status), status);
  }

  const role = resolveRole(data.user.user_metadata?.role);
  const redirectTo = getDefaultDashboard(role);
  const response = apiSuccess({ redirectTo });

  response.cookies.set("sb-role", role, {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });

  fireAndForget(
    createAuditLog("user.login", "users", data.user.id, { email: parsed.data.email, role }, data.user.id)
  );

  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}
