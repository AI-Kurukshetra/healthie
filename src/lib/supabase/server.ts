import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

export function createSupabaseServerComponentClient() {
  return createServerComponentClient<Database>({ cookies });
}

export function createSupabaseRouteHandlerClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

export function createSupabaseServerActionClient() {
  return createServerActionClient<Database>({ cookies });
}

