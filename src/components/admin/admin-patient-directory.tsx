import Link from "next/link";
import { format } from "date-fns";
import { Mail, Phone, Plus, SquarePen } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminPatientRecord } from "@/components/admin/admin-patient-types";

function formatOptionalDate(value: string | null | undefined) {
  if (!value) {
    return "Not provided";
  }

  return format(new Date(value), "MMM d, yyyy");
}

export function AdminPatientDirectory({ patients }: { patients: AdminPatientRecord[] }) {
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

  const withPhoneCount = patients.filter((patient) => patient.phone).length;
  const withInsuranceCount = patients.filter((patient) => patient.insurance_provider).length;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Patient directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Existing patients in a structured data grid.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Use this page to scan the roster quickly. Open a patient to modify details, or use the dedicated add screen for new records.</p>
          </div>

          <Link className={buttonVariants({ size: "sm" })} href="/admin/patients/new">
            <Plus className="h-4 w-4" />
            Add patient
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total patients</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{patients.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With phone</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withPhoneCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With insurance</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withInsuranceCount}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Patient roster</h3>
            <p className="mt-1 text-sm text-muted">A data grid for reviewing contact information and key profile details.</p>
          </div>
          <Badge>{patients.length} rows</Badge>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">DOB</th>
                <th className="px-6 py-4 font-semibold">Emergency</th>
                <th className="px-6 py-4 font-semibold">Insurance</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {patients.map((patient) => (
                <tr key={patient.id} className="align-top">
                  <td className="px-6 py-4">
                    <div className="flex min-w-[240px] items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0" name={patient.user?.full_name ?? patient.user?.email ?? "Patient"} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{patient.user?.full_name ?? "Unnamed patient"}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{patient.user?.email ?? "Email unavailable"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    <div className="flex min-w-[130px] items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{patient.phone ?? "Not provided"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{formatOptionalDate(patient.date_of_birth)}</td>
                  <td className="px-6 py-4 text-muted">{patient.emergency_contact ?? "Not provided"}</td>
                  <td className="px-6 py-4 text-muted">{patient.insurance_provider ?? "Not provided"}</td>
                  <td className="px-6 py-4 text-muted">{format(new Date(patient.created_at), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/patients/${patient.user_id}`}>
                      <SquarePen className="h-4 w-4" />
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {patients.map((patient) => (
            <div key={patient.id} className="rounded-[22px] border border-border/80 bg-surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0" name={patient.user?.full_name ?? patient.user?.email ?? "Patient"} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{patient.user?.full_name ?? "Unnamed patient"}</p>
                    <p className="truncate text-sm text-muted">{patient.user?.email ?? "Email unavailable"}</p>
                  </div>
                </div>
                <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/patients/${patient.user_id}`}>
                  Manage
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Phone</p>
                  <p className="mt-1 text-sm text-ink">{patient.phone ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">DOB</p>
                  <p className="mt-1 text-sm text-ink">{formatOptionalDate(patient.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Emergency</p>
                  <p className="mt-1 text-sm text-ink">{patient.emergency_contact ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Insurance</p>
                  <p className="mt-1 text-sm text-ink">{patient.insurance_provider ?? "Not provided"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
