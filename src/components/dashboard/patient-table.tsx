import { Card } from "@/components/ui/card";

type PatientRow = {
  id: string;
  name: string;
  insurance?: string | null;
  phone?: string | null;
};

export function PatientTable({ rows }: { rows: PatientRow[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-lg font-semibold text-ink">Patient roster</h3>
        <p className="mt-1 text-sm text-muted">A structured view for current patients and outreach priorities.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-surface-muted text-muted">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-6 py-4 font-semibold">Insurance</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 font-medium text-ink">{row.name}</td>
                <td className="px-6 py-4 text-muted">{row.insurance ?? "Not added"}</td>
                <td className="px-6 py-4 text-muted">{row.phone ?? "Not added"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
