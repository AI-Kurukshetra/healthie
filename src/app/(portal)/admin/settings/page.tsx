import { formatDistanceToNow } from "date-fns";

import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { AuditLog } from "@/types/domain";

export default async function AdminSettingsPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const auditQuery = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(12);
  const logs = (auditQuery.data ?? []) as AuditLog[];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-ink">Admin settings</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Use this area for platform-level controls, compliance reviews, and operational guardrails. The current implementation exposes recent audit activity so settings do not resolve to a dead end.</p>
      </Card>

      {logs.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-ink">Recent audit activity</h3>
          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-[20px] border border-border bg-surface-muted px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{log.action}</p>
                  <p className="text-sm text-muted">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{log.entity_type}{log.entity_id ? ` - ${log.entity_id.slice(0, 8)}` : ""}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState description="Audit activity will appear here as platform actions are recorded." title="No audit activity" />
      )}
    </div>
  );
}
