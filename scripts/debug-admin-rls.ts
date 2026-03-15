import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // Simulate what admin sees by using exec_sql with set role
  const adminId = "70c4b41a-3bbd-4594-847a-d817c254a30f"; // hardik.patel

  // Test current_role for admin
  const roleCheck = await supabase.rpc("exec_sql", {
    query: `select public.current_role() as role from public.users where id = '${adminId}'`
  });
  console.log("Admin role check:", JSON.stringify(roleCheck.data));

  // Test what happens when admin queries patients with join
  // Using service role but simulating the RLS check
  const policyCheck = await supabase.rpc("exec_sql", {
    query: `
      select p.id, p.user_id, u.full_name, u.email
      from public.patients p
      join public.users u on u.id = p.user_id
    `
  });
  console.log("\nPatients via join (service role):", JSON.stringify(policyCheck.data, null, 2));

  // Check all RLS policies on patients table
  const policies = await supabase.rpc("exec_sql", {
    query: `
      select policyname, permissive, roles, cmd, qual
      from pg_policies
      where tablename = 'patients'
    `
  });
  console.log("\nPatients RLS policies:", JSON.stringify(policies.data, null, 2));

  // Check all RLS policies on providers table
  const provPolicies = await supabase.rpc("exec_sql", {
    query: `
      select policyname, permissive, roles, cmd, qual
      from pg_policies
      where tablename = 'providers'
    `
  });
  console.log("\nProviders RLS policies:", JSON.stringify(provPolicies.data, null, 2));

  // Check users table policies
  const userPolicies = await supabase.rpc("exec_sql", {
    query: `
      select policyname, permissive, roles, cmd, qual
      from pg_policies
      where tablename = 'users'
    `
  });
  console.log("\nUsers RLS policies:", JSON.stringify(userPolicies.data, null, 2));
}

main();
