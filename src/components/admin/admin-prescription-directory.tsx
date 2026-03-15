"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Pill, Plus, Search, SquarePen, Stethoscope, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { Patient, Prescription, Provider } from "@/types/domain";

export function AdminPrescriptionDirectory({
  prescriptions,
  patients,
  providers
}: {
  prescriptions: Prescription[];
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
    if (!query.trim()) return prescriptions;
    const q = query.toLowerCase();
    return prescriptions.filter((rx) => {
      const patientName = (patientMap.get(rx.patient_id)?.user?.full_name ?? "").toLowerCase();
      const providerName = (providerMap.get(rx.provider_id)?.user?.full_name ?? "").toLowerCase();
      const medication = rx.medication_name.toLowerCase();
      const dosage = rx.dosage.toLowerCase();
      const duration = rx.duration.toLowerCase();
      return patientName.includes(q) || providerName.includes(q) || medication.includes(q) || dosage.includes(q) || duration.includes(q);
    });
  }, [prescriptions, query, patientMap, providerMap]);

  const uniquePatientIds = new Set(prescriptions.map((rx) => rx.patient_id));
  const uniqueProviderIds = new Set(prescriptions.map((rx) => rx.provider_id));

  if (prescriptions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Prescriptions</h2>
            <p className="mt-2 text-sm text-muted">Browse the current prescriptions. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/prescriptions/new">
            <Plus className="h-4 w-4" />
            Add prescription
          </Link>
        </Card>
        <EmptyState description="No prescriptions are in the directory yet. Create the first prescription from the dedicated add-prescription screen." title="No prescriptions found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Prescription directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage prescriptions</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review prescriptions, and open any record for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/prescriptions/new">
            <Plus className="h-4 w-4" />
            Add prescription
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total prescriptions</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{prescriptions.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Patients receiving</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{uniquePatientIds.size}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Providers prescribing</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{uniqueProviderIds.size}</p>
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
              placeholder="Search by patient, provider, medication, dosage, duration..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {prescriptions.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No prescriptions match &ldquo;{query}&rdquo;</p>
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
                    <th className="px-6 py-3.5 font-semibold">Medication</th>
                    <th className="px-6 py-3.5 font-semibold">Dosage</th>
                    <th className="px-6 py-3.5 font-semibold">Duration</th>
                    <th className="px-6 py-3.5 font-semibold">Created</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((rx) => {
                    const patient = patientMap.get(rx.patient_id);
                    const provider = providerMap.get(rx.provider_id);
                    return (
                      <tr key={rx.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unnamed"}</p>
                              <p className="mt-0.5 truncate text-xs text-muted">{patient?.user?.email ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{provider?.user?.full_name ?? "Unknown"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-ink">{rx.medication_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{rx.dosage}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{rx.duration}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-ink">{format(new Date(rx.created_at), "MMM d, yyyy")}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/prescriptions/${rx.id}`}>
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
              {filtered.map((rx) => {
                const patient = patientMap.get(rx.patient_id);
                const provider = providerMap.get(rx.provider_id);
                return (
                  <div key={rx.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unnamed"}</p>
                          <p className="truncate text-xs text-muted">{patient?.user?.email ?? "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Provider</p>
                        <p className="mt-1 text-sm text-ink">{provider?.user?.full_name ?? "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Medication</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{rx.medication_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Dosage</p>
                        <p className="mt-1 text-sm text-ink">{rx.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Duration</p>
                        <p className="mt-1 text-sm text-ink">{rx.duration}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                      <p className="text-xs text-muted">Created {format(new Date(rx.created_at), "MMM d, yyyy")}</p>
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/prescriptions/${rx.id}`}>
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
