import Link from "next/link";
import { format } from "date-fns";
import { BadgeCheck, Mail, Plus, SquarePen } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";

export function AdminProviderDirectory({ providers }: { providers: AdminProviderRecord[] }) {
  if (providers.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Providers</h2>
            <p className="mt-2 text-sm text-muted">Browse the provider roster. Creation and edits are handled on separate screens.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/providers/new">
            <Plus className="h-4 w-4" />
            Add provider
          </Link>
        </Card>

        <EmptyState description="No providers are in the directory yet. Create the first provider from the dedicated add-provider screen." title="No providers found" />
      </div>
    );
  }

  const withSpecialtyCount = providers.filter((provider) => provider.specialty).length;
  const withLicenseCount = providers.filter((provider) => provider.license_number).length;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Provider directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Existing providers in a structured data grid.</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Use this page to scan the provider roster quickly. Open a provider to modify details, or use the dedicated add screen for new records.</p>
          </div>

          <Link className={buttonVariants({ size: "sm" })} href="/admin/providers/new">
            <Plus className="h-4 w-4" />
            Add provider
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total providers</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{providers.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With specialty</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withSpecialtyCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">With license</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{withLicenseCount}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Provider roster</h3>
            <p className="mt-1 text-sm text-muted">A data grid for reviewing provider identity, specialty, and credentials.</p>
          </div>
          <Badge>{providers.length} rows</Badge>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Specialty</th>
                <th className="px-6 py-4 font-semibold">License</th>
                <th className="px-6 py-4 font-semibold">Bio</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {providers.map((provider) => (
                <tr key={provider.id} className="align-top">
                  <td className="px-6 py-4">
                    <div className="flex min-w-[240px] items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0" name={provider.user?.full_name ?? provider.user?.email ?? "Provider"} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{provider.user?.full_name ?? "Unnamed provider"}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{provider.user?.email ?? "Email unavailable"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{provider.specialty ?? "Not provided"}</td>
                  <td className="px-6 py-4 text-muted">{provider.license_number ?? "Not provided"}</td>
                  <td className="max-w-[320px] px-6 py-4 text-muted">
                    <p className="line-clamp-3">{provider.bio ?? "Not provided"}</p>
                  </td>
                  <td className="px-6 py-4 text-muted">{format(new Date(provider.created_at), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/providers/${provider.user_id}`}>
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
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-[22px] border border-border/80 bg-surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0" name={provider.user?.full_name ?? provider.user?.email ?? "Provider"} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{provider.user?.full_name ?? "Unnamed provider"}</p>
                    <p className="truncate text-sm text-muted">{provider.user?.email ?? "Email unavailable"}</p>
                  </div>
                </div>
                <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/providers/${provider.user_id}`}>
                  Manage
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Specialty</p>
                  <p className="mt-1 text-sm text-ink">{provider.specialty ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">License</p>
                  <p className="mt-1 text-sm text-ink">{provider.license_number ?? "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-deep">Bio</p>
                  <p className="mt-1 text-sm text-ink">{provider.bio ?? "Not provided"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
