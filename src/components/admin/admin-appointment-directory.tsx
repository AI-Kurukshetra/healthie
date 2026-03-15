"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, Plus, Search, SquarePen } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { Appointment, Patient, Provider } from "@/types/domain";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function formatScheduledDate(value: string) {
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

export function AdminAppointmentDirectory({
  appointments,
  patients,
  providers,
}: {
  appointments: Appointment[];
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
    if (!query.trim()) return appointments;
    const q = query.toLowerCase();
    return appointments.filter((a) => {
      const patientName = (patientMap.get(a.patient_id)?.user?.full_name ?? "").toLowerCase();
      const providerName = (providerMap.get(a.provider_id)?.user?.full_name ?? "").toLowerCase();
      const reason = (a.reason ?? "").toLowerCase();
      const status = a.status.toLowerCase();
      return patientName.includes(q) || providerName.includes(q) || reason.includes(q) || status.includes(q);
    });
  }, [appointments, query, patientMap, providerMap]);

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  if (appointments.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Appointments</h2>
            <p className="mt-2 text-sm text-muted">Browse and manage all scheduled appointments.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/appointments/new">
            <Plus className="h-4 w-4" />
            Add appointment
          </Link>
        </Card>
        <EmptyState description="No appointments have been scheduled yet. Create the first appointment from the dedicated add-appointment screen." title="No appointments found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Appointment directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage your appointments</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review schedules, and open any appointment for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/appointments/new">
            <Plus className="h-4 w-4" />
            Add appointment
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{appointments.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Pending</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{pendingCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Confirmed</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{confirmedCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Completed</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{completedCount}</p>
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
              placeholder="Search by patient, provider, reason, or status..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {appointments.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No appointments match &ldquo;{query}&rdquo;</p>
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
                    <th className="px-6 py-3.5 font-semibold">Scheduled</th>
                    <th className="px-6 py-3.5 font-semibold">Reason</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((appointment) => {
                    const patient = patientMap.get(appointment.patient_id);
                    const provider = providerMap.get(appointment.provider_id);
                    return (
                      <tr key={appointment.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                            <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unknown patient"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0" name={provider?.user?.full_name ?? provider?.user?.email ?? "D"} />
                            <p className="truncate font-semibold text-ink">{provider?.user?.full_name ?? "Unknown provider"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                          {formatScheduledDate(appointment.scheduled_at)}
                        </td>
                        <td className="max-w-[200px] px-6 py-4">
                          {appointment.reason ? (
                            <p className="truncate text-sm text-ink">{appointment.reason}</p>
                          ) : (
                            <p className="text-xs text-muted">No reason</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/appointments/${appointment.id}`}>
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
              {filtered.map((appointment) => {
                const patient = patientMap.get(appointment.patient_id);
                const provider = providerMap.get(appointment.provider_id);
                return (
                  <div key={appointment.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={patient?.user?.full_name ?? patient?.user?.email ?? "P"} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{patient?.user?.full_name ?? "Unknown patient"}</p>
                          <p className="truncate text-xs text-muted">with {provider?.user?.full_name ?? "Unknown provider"}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[appointment.status] ?? ""}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Scheduled</p>
                        <p className="mt-1 text-sm text-ink">{formatScheduledDate(appointment.scheduled_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Reason</p>
                        <p className="mt-1 truncate text-sm text-ink">{appointment.reason ?? <span className="text-muted">-</span>}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-border/60 pt-3">
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/appointments/${appointment.id}`}>
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
