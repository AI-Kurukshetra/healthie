import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });

  await supabase.auth.getUser();

  return response;
}

