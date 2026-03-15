export const dynamic = "force-dynamic";

import { format, subDays, isAfter, eachDayOfInterval } from "date-fns";
import { Activity, CalendarDays, ClipboardList, FileText, MessageSquare, Pill, TrendingUp, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AppointmentStatusChart,
  DailyActivityChart,
  ProviderWorkloadChart,
  UserRoleChart,
  CompletionGauge
} from "@/components/analytics/analytics-charts";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Appointment, ClinicalNote, MedicalRecord, Patient, Prescription, Provider, UserProfile } from "@/types/domain";

export default async function AdminAnalyticsPage() {
  await requireRole("admin");
  const supabase = createSupabaseAdminClient() as any;

  const [
    usersQuery, patientsQuery, providersQuery,
    appointmentsQuery, recordsQuery, notesQuery,
    prescriptionsQuery, messagesCountQuery
  ] = await Promise.all([
    supabase.from("users").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }),
    supabase.from("patients").select("id, user_id, created_at"),
    supabase.from("providers").select("id, user_id, specialty, created_at, user:users(id, full_name, email)"),
    supabase.from("appointments").select("id, patient_id, provider_id, status, scheduled_at, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("medical_records").select("id, patient_id, provider_id, created_at").limit(500),
    supabase.from("clinical_notes").select("id, provider_id, patient_id, created_at").limit(500),
    supabase.from("prescriptions").select("id, provider_id, patient_id, created_at").limit(500),
    supabase.from("messages").select("id", { count: "exact", head: true })
  ]);

  const users = (usersQuery.data ?? []) as UserProfile[];
  const patients = (patientsQuery.data ?? []) as Patient[];
  const providers = (providersQuery.data ?? []) as Provider[];
  const appointments = (appointmentsQuery.data ?? []) as Appointment[];
  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const notes = (notesQuery.data ?? []) as ClinicalNote[];
  const prescriptions = (prescriptionsQuery.data ?? []) as Prescription[];
  const messageCount = messagesCountQuery.count ?? 0;

  // --- Computed metrics ---
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;
  const completionRate = appointments.length > 0 ? Math.round((completedCount / appointments.length) * 100) : 0;
  const cancellationRate = appointments.length > 0 ? Math.round((cancelledCount / appointments.length) * 100) : 0;
  const providerRatio = providers.length > 0 ? Math.round(patients.length / providers.length) : 0;

  // --- Last 7 days ---
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentAppointments = appointments.filter((a) => isAfter(new Date(a.created_at), sevenDaysAgo)).length;
  const recentRecords = records.filter((r) => isAfter(new Date(r.created_at), sevenDaysAgo)).length;
  const recentNotes = notes.filter((n) => isAfter(new Date(n.created_at), sevenDaysAgo)).length;
  const recentPrescriptions = prescriptions.filter((p) => isAfter(new Date(p.created_at), sevenDaysAgo)).length;
  const recentUsers = users.filter((u) => isAfter(new Date(u.created_at), sevenDaysAgo)).length;

  // --- Chart data: Appointment Status Donut ---
  const statusChartData = [
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
    { name: "Confirmed", value: confirmedCount, color: "#10b981" },
    { name: "Completed", value: completedCount, color: "#3b82f6" },
    { name: "Cancelled", value: cancelledCount, color: "#ef4444" }
  ].filter((d) => d.value > 0);

  // --- Chart data: Daily Activity (last 14 days) ---
  const fourteenDaysAgo = subDays(new Date(), 13);
  const dayRange = eachDayOfInterval({ start: fourteenDaysAgo, end: new Date() });
  const dailyActivityData = dayRange.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return {
      day: format(day, "MMM d"),
      appointments: appointments.filter((a) => format(new Date(a.created_at), "yyyy-MM-dd") === dayStr).length,
      records: records.filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") === dayStr).length,
      prescriptions: prescriptions.filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") === dayStr).length
    };
  });

  // --- Chart data: User Role Distribution ---
  const patientUsers = users.filter((u) => u.role === "patient").length;
  const providerUsers = users.filter((u) => u.role === "provider").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const userRoleData = [
    { name: "Patients", value: patientUsers },
    { name: "Providers", value: providerUsers },
    { name: "Admins", value: adminUsers }
  ].filter((d) => d.value > 0);

  // --- Chart data: Provider Workload ---
  const providerStats = providers.map((p) => {
    const name = (p.user?.full_name ?? p.user?.email ?? "Provider").split(" ")[0];
    const apptCount = appointments.filter((a) => a.provider_id === p.id).length;
    const completedAppts = appointments.filter((a) => a.provider_id === p.id && a.status === "completed").length;
    const noteCount = notes.filter((n) => n.provider_id === p.id).length;
    const rxCount = prescriptions.filter((rx) => rx.provider_id === p.id).length;
    const patientCount = new Set(appointments.filter((a) => a.provider_id === p.id).map((a) => a.patient_id)).size;
    return { id: p.id, name, fullName: p.user?.full_name ?? p.user?.email ?? "Provider", specialty: p.specialty, apptCount, completedAppts, noteCount, rxCount, patientCount };
  }).sort((a, b) => b.apptCount - a.apptCount);

  const providerWorkloadData = providerStats.map((p) => ({
    name: p.name,
    appointments: p.apptCount,
    notes: p.noteCount,
    prescriptions: p.rxCount
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="max-w-2xl">
          <Badge>Analytics</Badge>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Platform metrics and operational insights.</h2>
          <p className="mt-2 text-sm leading-7 text-muted">Real-time breakdown of appointments, clinical activity, provider workload, and platform growth.</p>
        </div>
      </Card>

      {/* Top-line KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays className="h-5 w-5" /></div>
            <div>
              <p className="text-3xl font-bold text-ink">{appointments.length}</p>
              <p className="text-xs text-muted">Total appointments</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">{completionRate}%</p>
              <p className="text-xs text-muted">Completion rate</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-3xl font-bold text-ink">{users.length}</p>
              <p className="text-xs text-muted">Registered users</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Activity className="h-5 w-5" /></div>
            <div>
              <p className="text-3xl font-bold text-ink">{providerRatio}:1</p>
              <p className="text-xs text-muted">Patient-to-provider</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1: Status Donut + Daily Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AppointmentStatusChart data={statusChartData} />
        <DailyActivityChart data={dailyActivityData} />
      </div>

      {/* Charts Row 2: User Roles + Completion/Cancellation Gauges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <UserRoleChart data={userRoleData} />
        <CompletionGauge rate={completionRate} label="Completion rate" />
        <CompletionGauge rate={cancellationRate} label="Cancellation rate" />
      </div>

      {/* Chart Row 3: Provider Workload Bar Chart */}
      <ProviderWorkloadChart data={providerWorkloadData} />

      {/* 7-Day Activity + Clinical Volume */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Last 7 days activity</h3>
          <div className="mt-4 space-y-2.5">
            {[
              { icon: Users, label: "New users", value: recentUsers, color: "text-blue-600" },
              { icon: CalendarDays, label: "Appointments created", value: recentAppointments, color: "text-emerald-600" },
              { icon: FileText, label: "Medical records", value: recentRecords, color: "text-purple-600" },
              { icon: ClipboardList, label: "Clinical notes", value: recentNotes, color: "text-sky-600" },
              { icon: Pill, label: "Prescriptions issued", value: recentPrescriptions, color: "text-amber-600" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm text-ink">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-ink">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 text-center">
            <FileText className="mx-auto h-6 w-6 text-purple-500" />
            <p className="mt-3 text-3xl font-bold text-ink">{records.length}</p>
            <p className="mt-1 text-xs text-muted">Medical records</p>
          </Card>
          <Card className="p-5 text-center">
            <ClipboardList className="mx-auto h-6 w-6 text-sky-500" />
            <p className="mt-3 text-3xl font-bold text-ink">{notes.length}</p>
            <p className="mt-1 text-xs text-muted">Clinical notes</p>
          </Card>
          <Card className="p-5 text-center">
            <Pill className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-3 text-3xl font-bold text-ink">{prescriptions.length}</p>
            <p className="mt-1 text-xs text-muted">Prescriptions</p>
          </Card>
          <Card className="p-5 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-emerald-500" />
            <p className="mt-3 text-3xl font-bold text-ink">{messageCount}</p>
            <p className="mt-1 text-xs text-muted">Messages sent</p>
          </Card>
        </div>
      </div>

      {/* Provider Performance Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Provider performance</h3>
            <p className="mt-1 text-sm text-muted">Workload distribution — appointments, notes, prescriptions, and patient volume per provider.</p>
          </div>
          <Badge>{providers.length} providers</Badge>
        </div>

        {providers.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">No providers registered yet.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Provider</th>
                    <th className="px-6 py-4 font-semibold">Specialty</th>
                    <th className="px-6 py-4 text-center font-semibold">Patients</th>
                    <th className="px-6 py-4 text-center font-semibold">Appointments</th>
                    <th className="px-6 py-4 text-center font-semibold">Completed</th>
                    <th className="px-6 py-4 text-center font-semibold">Notes</th>
                    <th className="px-6 py-4 text-center font-semibold">Prescriptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {providerStats.map((p) => (
                    <tr key={p.id} className="align-middle">
                      <td className="px-6 py-4">
                        <div className="flex min-w-[160px] items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0" name={p.fullName} />
                          <span className="font-medium text-ink">{p.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{p.specialty ?? "—"}</td>
                      <td className="px-6 py-4 text-center font-semibold text-ink">{p.patientCount}</td>
                      <td className="px-6 py-4 text-center font-semibold text-ink">{p.apptCount}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{p.completedAppts}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-ink">{p.noteCount}</td>
                      <td className="px-6 py-4 text-center font-semibold text-ink">{p.rxCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {providerStats.map((p) => (
                <div key={p.id} className="rounded-[22px] border border-border/80 bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9" name={p.fullName} />
                    <div>
                      <p className="font-semibold text-ink">{p.fullName}</p>
                      <p className="text-xs text-muted">{p.specialty ?? "No specialty"}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white p-2">
                      <p className="text-lg font-bold text-ink">{p.apptCount}</p>
                      <p className="text-[10px] text-muted">Appts</p>
                    </div>
                    <div className="rounded-lg bg-white p-2">
                      <p className="text-lg font-bold text-ink">{p.noteCount}</p>
                      <p className="text-[10px] text-muted">Notes</p>
                    </div>
                    <div className="rounded-lg bg-white p-2">
                      <p className="text-lg font-bold text-ink">{p.rxCount}</p>
                      <p className="text-[10px] text-muted">Rx</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
