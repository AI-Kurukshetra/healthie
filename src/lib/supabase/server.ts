import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { readEmergencySession } from "@/lib/emergency-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export function createSupabaseServerComponentClient() {
  if (readEmergencySession()) {
    return createSupabaseAdminClient() as any;
  }

  return createServerComponentClient<Database>({ cookies });
}

export function createSupabaseRouteHandlerClient() {
  if (readEmergencySession()) {
    return createSupabaseAdminClient() as any;
  }

  return createRouteHandlerClient<Database>({ cookies });
}

export function createSupabaseServerActionClient() {
  if (readEmergencySession()) {
    return createSupabaseAdminClient() as any;
  }

  return createServerActionClient<Database>({ cookies });
}

