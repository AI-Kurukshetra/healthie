import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/types/domain";

export function AppointmentCalendar({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card className="border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,253,0.98)_100%)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">Appointment timeline</h3>
          <p className="mt-1 text-sm text-muted">The next scheduled visits, ordered for a quick scan.</p>
        </div>
        <Badge>{String(appointments.length)} scheduled</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border p-6 text-sm text-muted">No appointments available yet.</div>
        ) : (
          appointments.slice(0, 6).map((appointment) => (
            <div key={appointment.id} className="rounded-[20px] border border-border/80 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{format(new Date(appointment.scheduled_at), "EEE, MMM d - h:mm a")}</p>
                  <p className="mt-1 text-sm text-muted">{appointment.reason ?? "General consultation"}</p>
                </div>
                <Badge className="capitalize">{appointment.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
