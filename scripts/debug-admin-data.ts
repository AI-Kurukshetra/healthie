import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // Check all users
  const { data: users } = await supabase.from("users").select("id, email, role");
  console.log("=== Users ===");
  console.table(users);

  // Check all patients
  const { data: patients } = await supabase.from("patients").select("id, user_id");
  console.log("\n=== Patients ===");
  console.table(patients);

  // Check all providers
  const { data: providers } = await supabase.from("providers").select("id, user_id, specialty");
  console.log("\n=== Providers ===");
  console.table(providers);

  // Check auth users
  const { data: authData } = await supabase.auth.admin.listUsers();
  console.log("\n=== Auth Users ===");
  authData?.users.forEach((u) => {
    console.log(`  ${u.email} | role: ${u.user_metadata?.role} | id: ${u.id}`);
  });

  // Check if the listPatients join works with service role
  const { data: patientsWithUsers, error: pErr } = await supabase
    .from("patients")
    .select("id, user_id, user:users(id, email, full_name, role)")
    .order("created_at", { ascending: false })
    .limit(10);
  console.log("\n=== Patients with user join ===");
  console.log(JSON.stringify(patientsWithUsers, null, 2));
  if (pErr) console.log("Error:", pErr.message);

  const { data: providersWithUsers, error: prErr } = await supabase
    .from("providers")
    .select("id, user_id, user:users(id, email, full_name, role)")
    .order("created_at", { ascending: false })
    .limit(10);
  console.log("\n=== Providers with user join ===");
  console.log(JSON.stringify(providersWithUsers, null, 2));
  if (prErr) console.log("Error:", prErr.message);
}

main();
