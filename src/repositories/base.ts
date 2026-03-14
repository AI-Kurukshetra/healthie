import type { PostgrestError } from "@supabase/supabase-js";

import type { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export type SupabaseTypedClient = ReturnType<typeof createSupabaseServerComponentClient>;

export function unwrapError(error: PostgrestError | null, fallback: string) {
  if (!error) {
    return null;
  }

  return error.message || fallback;
}
