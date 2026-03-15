export const dynamic = "force-dynamic";

import { format } from "date-fns";
import { Activity, Database, RefreshCw, Settings, Shield, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuditLog, UserProfile } from "@/types/domain";

const actionLabels: Record<string, { label: string; color: string }> = {
  "appointment.created": { label: "Created appointment", color: "bg-emerald-50 text-emerald-700" },
  "appointment.updated": { label: "Updated appointment", color: "bg-blue-50 text-blue-700" },
  "appointment.deleted": { label: "Deleted appointment", color: "bg-red-50 text-red-700" },
  "medical_record.created": { label: "Created record", color: "bg-emerald-50 text-emerald-700" },
  "medical_record.updated": { label: "Updated record", color: "bg-blue-50 text-blue-700" },
  "medical_record.deleted": { label: "Deleted record", color: "bg-red-50 text-red-700" },
  "clinical_note.created": { label: "Created note", color: "bg-emerald-50 text-emerald-700" },
  "clinical_note.updated": { label: "Updated note", color: "bg-blue-50 text-blue-700" },
  "clinical_note.deleted": { label: "Deleted note", color: "bg-red-50 text-red-700" },
  "prescription.created": { label: "Issued prescription", color: "bg-purple-50 text-purple-700" },
  "prescription.updated": { label: "Updated prescription", color: "bg-blue-50 text-blue-700" },
  "prescription.deleted": { label: "Deleted prescription", color: "bg-red-50 text-red-700" },
  "message.created": { label: "Sent message", color: "bg-sky-50 text-sky-700" },
  "message.updated": { label: "Edited message", color: "bg-blue-50 text-blue-700" },
  "message.deleted": { label: "Deleted message", color: "bg-red-50 text-red-700" },
  "provider_availability.created": { label: "Set availability", color: "bg-emerald-50 text-emerald-700" },
  "provider_availability.deleted": { label: "Removed availability", color: "bg-red-50 text-red-700" }
};

function getActionDisplay(action: string) {
  return actionLabels[action] ?? { label: action, color: "bg-slate-100 text-slate-600" };
}

function getEntityLabel(entityType: string) {
  const labels: Record<string, string> = {
    appointments: "Appointment",
    medical_records: "Medical Record",
    clinical_notes: "Clinical Note",
    prescriptions: "Prescription",
    messages: "Message",
    provider_availability: "Availability"
  };
  return labels[entityType] ?? entityType;
}

export default async function AdminSettingsPage() {
  const { profile } = await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;

  const [auditQuery, usersQuery, statsQuery] = await Promise.all([
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("users").select("id, email, full_name, role"),
    Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("appointments").select("id", { count: "exact", head: true }),
      supabase.from("medical_records").select("id", { count: "exact", head: true }),
      supabase.from("prescriptions").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("audit_logs").select("id", { count: "exact", head: true })
    ])
  ]);

  const logs = (auditQuery.data ?? []) as AuditLog[];
  const users = (usersQuery.data ?? []) as UserProfile[];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const [usersCount, apptCount, recordsCount, rxCount, msgCount, auditCount] = statsQuery.map((q: any) => q.count ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Admin settings</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Platform overview and audit trail.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Monitor platform activity, review audit logs, and track operational metrics.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/85 px-4 py-3 shadow-soft">
            <Avatar className="h-9 w-9" name={profile.full_name ?? profile.email} />
            <div>
              <p className="text-sm font-semibold text-ink">{profile.full_name ?? profile.email}</p>
              <p className="text-xs text-muted capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { icon: Users, label: "Users", value: usersCount, color: "bg-blue-50 text-blue-600" },
          { icon: Activity, label: "Appointments", value: apptCount, color: "bg-emerald-50 text-emerald-600" },
          { icon: Database, label: "Records", value: recordsCount, color: "bg-purple-50 text-purple-600" },
          { icon: RefreshCw, label: "Prescriptions", value: rxCount, color: "bg-amber-50 text-amber-600" },
          { icon: Settings, label: "Messages", value: msgCount, color: "bg-sky-50 text-sky-600" },
          { icon: Shield, label: "Audit Logs", value: auditCount, color: "bg-slate-100 text-slate-600" }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Audit trail</h3>
            <p className="mt-1 text-sm text-muted">Complete log of platform activity — who did what, when, and to which entity.</p>
          </div>
          <Badge>{logs.length} recent entries</Badge>
        </div>

        {logs.length === 0 ? (
          <div className="p-6">
            <EmptyState description="Audit activity will appear here as users interact with the platform." title="No audit activity yet" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Actor</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Entity</th>
                    <th className="px-6 py-4 font-semibold">Entity ID</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {logs.map((log) => {
                    const actor = log.actor_id ? userMap.get(log.actor_id) : null;
                    const actionDisplay = getActionDisplay(log.action);
                    const metaEntries = Object.entries(log.metadata ?? {}).filter(([, v]) => v !== null && v !== undefined);

                    return (
                      <tr key={log.id} className="align-middle">
                        <td className="px-6 py-4">
                          {actor ? (
                            <div className="flex min-w-[180px] items-center gap-3">
                              <Avatar className="h-8 w-8 shrink-0" name={actor.full_name ?? actor.email} />
                              <div>
                                <p className="font-medium text-ink">{actor.full_name ?? actor.email}</p>
                                <p className="text-xs capitalize text-muted">{actor.role}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${actionDisplay.color}`}>
                            {actionDisplay.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">{getEntityLabel(log.entity_type)}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted">{log.entity_id ? log.entity_id.slice(0, 8) + "..." : "—"}</td>
                        <td className="max-w-[200px] px-6 py-4">
                          {metaEntries.length > 0 ? (
                            <div className="space-y-0.5">
                              {metaEntries.slice(0, 3).map(([k, v]) => (
                                <p key={k} className="truncate text-xs text-muted">
                                  <span className="font-medium">{k}:</span> {String(v)}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted">{format(new Date(log.created_at), "MMM d, h:mm a")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {logs.map((log) => {
                const actor = log.actor_id ? userMap.get(log.actor_id) : null;
                const actionDisplay = getActionDisplay(log.action);
                const metaEntries = Object.entries(log.metadata ?? {}).filter(([, v]) => v !== null && v !== undefined);

                return (
                  <div key={log.id} className="rounded-[22px] border border-border/80 bg-surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {actor ? (
                          <>
                            <Avatar className="h-7 w-7" name={actor.full_name ?? actor.email} />
                            <div>
                              <p className="text-sm font-medium text-ink">{actor.full_name ?? actor.email}</p>
                              <p className="text-xs capitalize text-muted">{actor.role}</p>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-muted">System</span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted">{format(new Date(log.created_at), "MMM d, h:mm a")}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${actionDisplay.color}`}>
                        {actionDisplay.label}
                      </span>
                      <span className="text-xs text-muted">{getEntityLabel(log.entity_type)}</span>
                      {log.entity_id && (
                        <span className="font-mono text-[10px] text-muted">{log.entity_id.slice(0, 8)}</span>
                      )}
                    </div>

                    {metaEntries.length > 0 && (
                      <div className="mt-2 rounded-lg bg-white p-2">
                        {metaEntries.slice(0, 3).map(([k, v]) => (
                          <p key={k} className="text-xs text-muted">
                            <span className="font-medium">{k}:</span> {String(v)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
