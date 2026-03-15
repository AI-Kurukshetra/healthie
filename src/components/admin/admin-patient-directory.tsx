"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Heart, Mail, Phone, Plus, Search, Shield, SquarePen, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";

function formatOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  return format(new Date(value), "MMM d, yyyy");
}

function profileCompleteness(patient: AdminPatientRecord) {
  const fields = [patient.user?.full_name, patient.date_of_birth, patient.phone, patient.emergency_contact, patient.insurance_provider];
  return fields.filter(Boolean).length;
}

function CompletenessBar({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted">{pct}%</span>
    </div>
  );
}

export function AdminPatientDirectory({ patients }: { patients: AdminPatientRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter((p) => {
      const name = (p.user?.full_name ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      const phone = (p.phone ?? "").toLowerCase();
      const insurance = (p.insurance_provider ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || insurance.includes(q);
    });
  }, [patients, query]);

  const withPhoneCount = patients.filter((p) => p.phone).length;
  const withInsuranceCount = patients.filter((p) => p.insurance_provider).length;
  const withEmergencyCount = patients.filter((p) => p.emergency_contact).length;
  const fullProfileCount = patients.filter((p) => profileCompleteness(p) === 5).length;

  if (patients.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Patients</h2>
            <p className="mt-2 text-sm text-muted">Browse the current patient roster. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/patients/new">
            <Plus className="h-4 w-4" />
            Add patient
          </Link>
        </Card>
        <EmptyState description="No patients are in the directory yet. Create the first patient from the dedicated add-patient screen." title="No patients found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Patient directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage your patient roster</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review profiles, and open any patient for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/patients/new">
            <Plus className="h-4 w-4" />
            Add patient
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{patients.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Complete profiles</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{fullProfileCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500">Emergency contact</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withEmergencyCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">With insurance</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withInsuranceCount}</p>
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
              placeholder="Search by name, email, phone, or insurance..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {patients.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No patients match &ldquo;{query}&rdquo;</p>
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
                    <th className="px-6 py-3.5 font-semibold">Contact</th>
                    <th className="px-6 py-3.5 font-semibold">DOB</th>
                    <th className="px-6 py-3.5 font-semibold">Insurance</th>
                    <th className="px-6 py-3.5 font-semibold">Profile</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((patient) => {
                    const completeness = profileCompleteness(patient);
                    return (
                      <tr key={patient.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[220px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={patient.user?.full_name ?? patient.user?.email ?? "P"} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{patient.user?.full_name ?? "Unnamed"}</p>
                              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                                <Mail className="h-3 w-3 shrink-0" />
                                {patient.user?.email ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {patient.phone ? (
                              <p className="flex items-center gap-1.5 text-sm text-ink">
                                <Phone className="h-3 w-3 shrink-0 text-muted" />
                                {patient.phone}
                              </p>
                            ) : (
                              <p className="text-xs text-muted">No phone</p>
                            )}
                            {patient.emergency_contact ? (
                              <p className="flex items-center gap-1.5 text-xs text-muted">
                                <Heart className="h-3 w-3 shrink-0 text-red-400" />
                                <span className="truncate max-w-[160px]">{patient.emergency_contact}</span>
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {patient.date_of_birth ? (
                            <p className="flex items-center gap-1.5 text-sm text-ink">
                              <Calendar className="h-3 w-3 shrink-0 text-muted" />
                              {formatOptionalDate(patient.date_of_birth)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted">Not set</p>
                          )}
                        </td>
                        <td className="max-w-[180px] px-6 py-4">
                          {patient.insurance_provider ? (
                            <p className="truncate text-sm text-ink">{patient.insurance_provider}</p>
                          ) : (
                            <p className="text-xs text-muted">None</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <CompletenessBar filled={completeness} total={5} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/patients/${patient.user_id}`}>
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
              {filtered.map((patient) => {
                const completeness = profileCompleteness(patient);
                return (
                  <div key={patient.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={patient.user?.full_name ?? patient.user?.email ?? "P"} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{patient.user?.full_name ?? "Unnamed"}</p>
                          <p className="truncate text-xs text-muted">{patient.user?.email ?? "—"}</p>
                        </div>
                      </div>
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/patients/${patient.user_id}`}>
                        Manage
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Phone</p>
                        <p className="mt-1 text-sm text-ink">{patient.phone ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">DOB</p>
                        <p className="mt-1 text-sm text-ink">{formatOptionalDate(patient.date_of_birth) ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Emergency</p>
                        <p className="mt-1 truncate text-sm text-ink">{patient.emergency_contact ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Insurance</p>
                        <p className="mt-1 truncate text-sm text-ink">{patient.insurance_provider ?? <span className="text-muted">—</span>}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                      <p className="text-xs text-muted">Profile completeness</p>
                      <CompletenessBar filled={completeness} total={5} />
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
