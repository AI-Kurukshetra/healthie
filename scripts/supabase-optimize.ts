/**
 * Supabase Performance Optimization Script
 *
 * Run with: npx tsx scripts/supabase-optimize.ts
 *
 * Steps:
 *   1. Creates a helper function (exec_sql) so we can run raw SQL via RPC
 *   2. Runs the performance migration (indexes, RLS fixes, realtime cleanup)
 *   3. Prints database stats (table sizes, connections, cache hit ratio)
 *   4. Prints connection pooler info
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function heading(text: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${text}`);
  console.log("=".repeat(60));
}

function section(text: string) {
  console.log(`\n--- ${text} ---`);
}

// Run a SELECT query using exec_sql (returns rows)
async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const { data, error } = await supabase.rpc("exec_sql", { query });

  if (error) {
    throw new Error(`SQL error: ${error.message}`);
  }

  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "error" in (data as any)) {
    const msg = (data as any).error;
    if (msg.includes("does not exist") || msg.includes("already exists") || msg.includes("pg_cron")) {
      console.log(`  (skipped: ${msg})`);
      return [];
    }
    throw new Error(`SQL error: ${msg}`);
  }
  return [];
}

// Run a DDL statement using run_ddl (CREATE, ALTER, ANALYZE, DO blocks, etc.)
async function ddl(query: string): Promise<string> {
  const { data, error } = await supabase.rpc("run_ddl", { query });

  if (error) {
    throw new Error(`DDL error: ${error.message}`);
  }

  const result = String(data ?? "ok");
  if (result !== "ok") {
    throw new Error(`DDL error: ${result}`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Step 1: Bootstrap exec_sql function
// ---------------------------------------------------------------------------
async function bootstrap() {
  heading("Step 1: Setting up SQL execution helpers");

  // Check exec_sql (for SELECT queries)
  const { error: execErr } = await supabase.rpc("exec_sql", { query: "select 1 as ok" });
  if (execErr) {
    console.log("  exec_sql function not found.");
    printSetupInstructions();
    return false;
  }
  console.log("  exec_sql function ready.");

  // Check run_ddl (for CREATE/ALTER/ANALYZE statements)
  const { error: ddlErr } = await supabase.rpc("run_ddl", { query: "select 1" });
  if (ddlErr) {
    console.log("  run_ddl function not found.");
    printSetupInstructions();
    return false;
  }
  console.log("  run_ddl function ready.");

  return true;
}

function printSetupInstructions() {
  console.log("");
  console.log("  Please run this SQL in the Supabase Dashboard SQL Editor");
  console.log("  (Dashboard > SQL Editor > New Query):");
  console.log("");
  console.log(`  ${"─".repeat(56)}`);
  console.log(`
  -- Helper 1: run SELECT queries and return rows as JSON
  create or replace function exec_sql(query text)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public
  as $fn$
  declare
    result jsonb;
  begin
    execute 'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (' || query || ') t'
      into result;
    return result;
  exception when others then
    return jsonb_build_object('error', SQLERRM);
  end;
  $fn$;

  -- Helper 2: run DDL statements (CREATE, ALTER, ANALYZE, etc.)
  create or replace function run_ddl(query text)
  returns text
  language plpgsql
  security definer
  set search_path = public
  as $fn$
  begin
    execute query;
    return 'ok';
  exception when others then
    return SQLERRM;
  end;
  $fn$;
  `);
  console.log(`  ${"─".repeat(56)}`);
  console.log("");
  console.log("  Then re-run: npx tsx scripts/supabase-optimize.ts");
}

// ---------------------------------------------------------------------------
// Step 2: Run performance migration
// ---------------------------------------------------------------------------
async function runMigration() {
  heading("Step 2: Running performance migration");

  const migrationPath = path.resolve(
    __dirname,
    "../supabase/migrations/20260315120000_performance_optimizations.sql"
  );

  if (!fs.existsSync(migrationPath)) {
    console.error(`  Migration file not found: ${migrationPath}`);
    return;
  }

  const fullSql = fs.readFileSync(migrationPath, "utf-8");
  const statements = splitStatements(fullSql);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      await ddl(stmt);
      success++;
      process.stdout.write(".");
    } catch (err: any) {
      const msg = String(err.message || err);
      if (
        msg.includes("already exists") ||
        msg.includes("does not exist") ||
        msg.includes("pg_cron") ||
        msg.includes("not available")
      ) {
        skipped++;
        process.stdout.write("s");
      } else {
        failed++;
        process.stdout.write("x");
        console.error(`\n  FAILED: ${stmt.slice(0, 80)}...`);
        console.error(`  ${msg}`);
      }
    }
  }

  console.log("");
  console.log(`  Results: ${success} applied, ${skipped} skipped, ${failed} failed`);
}

function splitStatements(sql: string): string[] {
  const results: string[] = [];
  let current = "";
  let inDollarQuote = false;
  let dollarTag = "";

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (ch === "$") {
      const rest = sql.slice(i);
      const match = rest.match(/^(\$\w*\$)/);
      if (match) {
        const tag = match[1];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = "";
        }
        current += tag;
        i += tag.length - 1;
        continue;
      }
    }

    if (ch === ";" && !inDollarQuote) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith("--")) {
        results.push(trimmed);
      }
      current = "";
    } else {
      current += ch;
    }
  }

  const trimmed = current.trim();
  if (trimmed && !trimmed.startsWith("--")) {
    results.push(trimmed);
  }

  // Filter out pure comment blocks
  return results.filter((s) => {
    const lines = s.split("\n").filter((l) => l.trim() && !l.trim().startsWith("--"));
    return lines.length > 0;
  });
}

// ---------------------------------------------------------------------------
// Step 3: Database stats
// ---------------------------------------------------------------------------
async function checkStats() {
  heading("Step 3: Database Resource Usage Report");

  // Table sizes
  section("Table Sizes");
  try {
    const rows = await sql(`
      select
        relname as table_name,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size,
        pg_size_pretty(pg_relation_size(relid)) as data_size,
        n_live_tup as estimated_rows
      from pg_stat_user_tables
      where schemaname = 'public'
      order by pg_total_relation_size(relid) desc
    `);
    console.table(rows);
  } catch {
    console.log("  (could not fetch table sizes)");
  }

  // Index usage
  section("Index Usage (top 20)");
  try {
    const rows = await sql(`
      select
        relname as table_name,
        indexrelname as index_name,
        idx_scan as scans,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      from pg_stat_user_indexes
      where schemaname = 'public'
      order by idx_scan desc
      limit 20
    `);
    console.table(rows);
  } catch {
    console.log("  (could not fetch index stats)");
  }

  // Active connections
  section("Database Connections");
  try {
    const rows = await sql(`
      select
        count(*)::int as total,
        count(*) filter (where state = 'active')::int as active,
        count(*) filter (where state = 'idle')::int as idle,
        count(*) filter (where state = 'idle in transaction')::int as idle_in_tx
      from pg_stat_activity
      where datname = current_database()
    `);
    console.table(rows);
  } catch {
    console.log("  (could not fetch connection stats)");
  }

  // Cache hit ratio
  section("Cache Hit Ratio");
  try {
    const rows = await sql(`
      select
        sum(heap_blks_read)::bigint as disk_reads,
        sum(heap_blks_hit)::bigint as cache_hits,
        case
          when sum(heap_blks_hit) + sum(heap_blks_read) = 0 then 100
          else round(sum(heap_blks_hit) * 100.0 / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)
        end as hit_ratio_pct
      from pg_statio_user_tables
    `);
    if (rows.length > 0) {
      const r = rows[0] as any;
      console.log(`  Cache hit ratio: ${r.hit_ratio_pct}%`);
      console.log(`  (Target: > 99%. Below 95% means you need more memory or fewer full scans)`);
    }
  } catch {
    console.log("  (could not fetch cache stats)");
  }

  // Realtime tables
  section("Realtime Publication Tables");
  try {
    const rows = await sql(`
      select tablename
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      order by tablename
    `);
    if (rows.length === 0) {
      console.log("  No tables in realtime publication.");
    } else {
      rows.forEach((r: any) => console.log(`  - ${r.tablename}`));
    }
  } catch {
    console.log("  (could not fetch realtime info)");
  }

  // DB size
  section("Total Database Size");
  try {
    const rows = await sql(`
      select pg_size_pretty(pg_database_size(current_database())) as size
    `);
    if (rows.length > 0) {
      console.log(`  Database size: ${(rows[0] as any).size}`);
    }
  } catch {
    console.log("  (could not fetch db size)");
  }
}

// ---------------------------------------------------------------------------
// Step 4: Pooler info
// ---------------------------------------------------------------------------
function printPoolerInfo() {
  heading("Step 4: Connection Pooler Info");

  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.log("  Could not determine project ref from URL.");
    return;
  }

  console.log(`  Project ref: ${projectRef}`);
  console.log("");
  console.log("  Your app uses the Supabase JS client which connects via the REST");
  console.log("  API gateway (PostgREST) — this already pools connections server-side.");
  console.log("  No additional pooler config is needed for the JS client.");
  console.log("");
  console.log("  If you ever add a direct DB connection (Prisma, Drizzle, etc.),");
  console.log("  use the pooler connection string:");
  console.log(`    Host: aws-0-[region].pooler.supabase.com`);
  console.log(`    Port: 6543`);
  console.log(`    User: postgres.${projectRef}`);
  console.log("");
  console.log("  You can find the exact string in:");
  console.log("  Dashboard > Project Settings > Database > Connection string > URI (pooler)");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("");
  console.log("  Supabase Performance Optimization Script");
  console.log("  ========================================");

  const ready = await bootstrap();
  if (!ready) return;

  await runMigration();
  await checkStats();
  printPoolerInfo();

  console.log("\n" + "=".repeat(60));
  console.log("  All done! Monitor Supabase Dashboard > Usage over 24-48h.");
  console.log("=".repeat(60));
  console.log("");
}

main().catch((err) => {
  console.error("\nScript failed:", err);
  process.exit(1);
});
