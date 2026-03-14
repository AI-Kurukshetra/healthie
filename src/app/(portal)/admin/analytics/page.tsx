import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { listClinicalNotes, listMedicalRecords } from "@/repositories/recordRepository";
import { getAdminDashboardData } from "@/services/portalService";
import type { Appointment, ClinicalNote, MedicalRecord, Prescription } from "@/types/domain";

export default async function AdminAnalyticsPage() {
  await requireRole("admin");
  const supabase = createSupabaseServerComponentClient();
  const [dashboardData, recordsQuery, notesQuery, messagesQuery] = await Promise.all([
    getAdminDashboardData(supabase),
    listMedicalRecords(supabase),
    listClinicalNotes(supabase),
    supabase.from("messages").select("id", { count: "exact", head: true })
  ]);

  const appointments = dashboardData.appointments as Appointment[];
  const prescriptions = dashboardData.prescriptions as Prescription[];
  const records = (recordsQuery.data ?? []) as MedicalRecord[];
  const notes = (notesQuery.data ?? []) as ClinicalNote[];
  const completedAppointments = appointments.filter((item) => item.status === "completed").length;
  const completionRate = appointments.length === 0 ? 0 : Math.round((completedAppointments / appointments.length) * 100);
  const confirmedAppointments = appointments.filter((item) => item.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard description="All booked visits across the platform" title="Appointment volume" value={appointments.length} tone="accent" />
        <DashboardCard description="Visits marked completed" title="Completion rate" value={`${completionRate}%`} />
        <DashboardCard description="Structured chart records on file" title="Medical records" value={records.length} />
        <DashboardCard description="Chat messages exchanged" title="Message volume" value={messagesQuery.count ?? 0} />
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-ink">Operations snapshot</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Confirmed appointments</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{confirmedAppointments}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Clinical notes</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{notes.length}</p>
          </div>
          <div className="rounded-[20px] bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted">Prescriptions</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{prescriptions.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
