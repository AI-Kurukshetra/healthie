"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, FileText, HeartPulse, Paperclip, Plus, Search, SquarePen } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { MedicalRecord, Patient, Provider } from "@/types/domain";

type RecordWithUrl = MedicalRecord & { documentUrl?: string | null };

export function AdminMedicalRecordDirectory({
  records,
  patients,
  providers
}: {
  records: RecordWithUrl[];
  patients: Patient[];
  providers: Provider[];
}) {
  const [query, setQuery] = useState("");

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) map.set(p.id, p);
    return map;
  }, [patients]);

  const providerMap = useMemo(() => {
    const map = new Map<string, Provider>();
    for (const p of providers) map.set(p.id, p);
    return map;
  }, [providers]);

  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.toLowerCase();
    return records.filter((r) => {
      const patientName = (patientMap.get(r.patient_id)?.user?.full_name ?? "").toLowerCase();
      const providerName = (r.provider_id ? providerMap.get(r.provider_id)?.user?.full_name ?? "" : "").toLowerCase();
      const diagnosis = (r.diagnosis ?? "").toLowerCase();
      const treatmentPlan = (r.treatment_plan ?? "").toLowerCase();
      return patientName.includes(q) || providerName.includes(q) || diagnosis.includes(q) || treatmentPlan.includes(q);
    });
  }, [records, query, patientMap, providerMap]);

  const withDocumentCount = records.filter((r) => r.documentUrl).length;
  const withTreatmentPlanCount = records.filter((r) => r.treatment_plan).length;

  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Medical Records</h2>
            <p className="mt-2 text-sm text-muted">Browse medical records. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/records/new">
            <Plus className="h-4 w-4" />
            Add record
          </Link>
        </Card>
        <EmptyState description="No medical records exist yet. Create the first record from the dedicated add-record screen." title="No records found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Medical records</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage medical records</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review records, and open any record for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/records/new">
            <Plus className="h-4 w-4" />
            Add record
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{records.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">With documents</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withDocumentCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">With treatment plan</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withTreatmentPlanCount}</p>
          </div>
        </div>
      </Card>

      {/* Search + Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, provider, diagnosis, or treatment..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {records.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No records match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-muted">Try a different search term or clear the filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Patient</th>
                    <th className="px-6 py-3.5 font-semibold">Provider</th>
                    <th className="px-6 py-3.5 font-semibold">Diagnosis</th>
                    <th className="px-6 py-3.5 font-semibold">Treatment Plan</th>
                    <th className="px-6 py-3.5 font-semibold">Created</th>
                    <th className="px-6 py-3.5 font-semibold">Doc</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((record) => {
                    const patient = patientMap.get(record.patient_id);
                    const provider = record.provider_id ? providerMap.get(record.provider_id) : null;
                    return (
                      <tr key={record.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unknown"}</p>
                              <p className="mt-0.5 truncate text-xs text-muted">{patient?.user?.email ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{provider?.user?.full_name ?? "—"}</p>
                        </td>
                        <td className="max-w-[200px] px-6 py-4">
                          <p className="truncate font-semibold text-ink">{record.diagnosis}</p>
                        </td>
                        <td className="max-w-[180px] px-6 py-4">
                          {record.treatment_plan ? (
                            <p className="truncate text-sm text-ink">{record.treatment_plan}</p>
                          ) : (
                            <p className="text-xs text-muted">None</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
                        </td>
                        <td className="px-6 py-4">
                          {record.documentUrl ? (
                            <a className="inline-flex items-center gap-1 text-primary-deep hover:underline" href={record.documentUrl} rel="noopener noreferrer" target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <p className="text-xs text-muted">—</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/records/${record.id}`}>
                            <SquarePen className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filtered.map((record) => {
                const patient = patientMap.get(record.patient_id);
                const provider = record.provider_id ? providerMap.get(record.provider_id) : null;
                return (
                  <div key={record.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unknown"}</p>
                          <p className="truncate text-xs text-muted">{record.diagnosis}</p>
                        </div>
                      </div>
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/records/${record.id}`}>
                        <SquarePen className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Provider</p>
                        <p className="mt-1 text-sm text-ink">{provider?.user?.full_name ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Created</p>
                        <p className="mt-1 text-sm text-ink">{format(new Date(record.created_at), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Treatment</p>
                        <p className="mt-1 truncate text-sm text-ink">{record.treatment_plan ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Document</p>
                        <p className="mt-1 text-sm text-ink">
                          {record.documentUrl ? (
                            <a className="inline-flex items-center gap-1 text-primary-deep hover:underline" href={record.documentUrl} rel="noopener noreferrer" target="_blank">
                              <ExternalLink className="h-3.5 w-3.5" /> View
                            </a>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-border/60 pt-3">
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/records/${record.id}`}>
                        <SquarePen className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </div>
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
