import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const statements = [
  `drop policy if exists "authenticated users read providers" on public.providers`,
  `create policy "authenticated users read providers" on public.providers for select using (auth.role() = 'authenticated')`,
  `drop policy if exists "providers read all patient profiles" on public.patients`,
  `create policy "providers read all patient profiles" on public.patients for select using (public.current_role() = 'provider')`,
  `drop policy if exists "providers read all patient user rows" on public.users`,
  `create policy "providers read all patient user rows" on public.users for select using (public.current_role() = 'provider' and exists (select 1 from public.patients p where p.user_id = users.id))`,
  `drop policy if exists "patients read all provider user rows" on public.users`,
  `create policy "patients read all provider user rows" on public.users for select using (public.current_role() = 'patient' and exists (select 1 from public.providers p where p.user_id = users.id))`
];

async function main() {
  console.log("Applying RLS policy fixes...\n");
  for (const sql of statements) {
    const { data, error } = await supabase.rpc("run_ddl", { query: sql });
    const result = String(data ?? "ok");
    if (error) {
      console.log("ERROR:", error.message);
    } else if (result !== "ok") {
      console.log("FAIL:", result);
    } else {
      console.log("OK:", sql.slice(0, 80));
    }
  }
  console.log("\nDone!");
}

main();
