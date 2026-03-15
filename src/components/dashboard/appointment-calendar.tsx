import { format, isToday, isTomorrow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/types/domain";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-600"
};

function relativeDay(date: Date) {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

export function AppointmentCalendar({ appointments }: { appointments: Appointment[] }) {
  const upcoming = appointments.filter((a) => new Date(a.scheduled_at).getTime() >= Date.now()).slice(0, 6);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Schedule</h3>
        <span className="text-xs text-muted">{upcoming.length} upcoming</span>
      </div>

      <div className="mt-4 space-y-2">
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">No upcoming appointments</div>
        ) : (
          upcoming.map((appointment) => {
            const date = new Date(appointment.scheduled_at);
            return (
              <div key={appointment.id} className="flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-center shadow-soft">
                  <span className="text-[10px] font-semibold uppercase text-muted">{format(date, "MMM")}</span>
                  <span className="text-sm font-bold text-ink">{format(date, "d")}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{relativeDay(date)}, {format(date, "h:mm a")}</p>
                  <p className="truncate text-xs text-muted">{appointment.reason ?? "General consultation"}</p>
                </div>
                <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColors[appointment.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {appointment.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
