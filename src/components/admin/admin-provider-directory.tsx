"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Award, BadgeCheck, Mail, Plus, Search, SquarePen, Stethoscope, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import type { AdminProviderRecord } from "@/components/admin/admin-provider-types";

function profileCompleteness(provider: AdminProviderRecord) {
  const fields = [provider.user?.full_name, provider.specialty, provider.license_number, provider.bio];
  return fields.filter(Boolean).length;
}

function CompletenessBar({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted">{pct}%</span>
    </div>
  );
}

export function AdminProviderDirectory({ providers }: { providers: AdminProviderRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return providers;
    const q = query.toLowerCase();
    return providers.filter((p) => {
      const name = (p.user?.full_name ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      const specialty = (p.specialty ?? "").toLowerCase();
      const license = (p.license_number ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || specialty.includes(q) || license.includes(q);
    });
  }, [providers, query]);

  const withSpecialtyCount = providers.filter((p) => p.specialty).length;
  const withLicenseCount = providers.filter((p) => p.license_number).length;
  const withBioCount = providers.filter((p) => p.bio).length;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(236,245,255,0.98)_100%)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Provider directory</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-ink">Manage your care team</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Search, review credentials, and open any provider for detailed editing.</p>
          </div>
          <Link className={buttonVariants({ size: "sm" })} href="/admin/providers/new">
            <Plus className="h-4 w-4" />
            Add provider
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">Total</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{providers.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">With specialty</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withSpecialtyCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Licensed</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withLicenseCount}</p>
          </div>
          <div className="rounded-[22px] border border-border/80 bg-white/85 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">With bio</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-ink">{withBioCount}</p>
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
              placeholder="Search by name, email, specialty, or license..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge>{filtered.length} of {providers.length}</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No providers match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs text-muted">Try a different search term or clear the filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Provider</th>
                    <th className="px-6 py-3.5 font-semibold">Specialty</th>
                    <th className="px-6 py-3.5 font-semibold">License</th>
                    <th className="px-6 py-3.5 font-semibold">Bio</th>
                    <th className="px-6 py-3.5 font-semibold">Profile</th>
                    <th className="px-6 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((provider) => {
                    const completeness = profileCompleteness(provider);
                    return (
                      <tr key={provider.id} className="transition-colors hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex min-w-[220px] items-center gap-3">
                            <Avatar className="h-10 w-10 shrink-0" name={provider.user?.full_name ?? provider.user?.email ?? "P"} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{provider.user?.full_name ?? "Unnamed"}</p>
                              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                                <Mail className="h-3 w-3 shrink-0" />
                                {provider.user?.email ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {provider.specialty ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <Stethoscope className="h-3 w-3" />
                              {provider.specialty}
                            </span>
                          ) : (
                            <span className="text-xs text-muted">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {provider.license_number ? (
                            <span className="flex items-center gap-1.5 text-sm text-ink">
                              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                              {provider.license_number}
                            </span>
                          ) : (
                            <span className="text-xs text-muted">None</span>
                          )}
                        </td>
                        <td className="max-w-[280px] px-6 py-4">
                          {provider.bio ? (
                            <p className="line-clamp-2 text-sm text-muted">{provider.bio}</p>
                          ) : (
                            <span className="text-xs text-muted">No bio</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <CompletenessBar filled={completeness} total={4} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/providers/${provider.user_id}`}>
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
              {filtered.map((provider) => {
                const completeness = profileCompleteness(provider);
                return (
                  <div key={provider.id} className="rounded-[22px] border border-border/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0" name={provider.user?.full_name ?? provider.user?.email ?? "P"} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{provider.user?.full_name ?? "Unnamed"}</p>
                          <p className="truncate text-xs text-muted">{provider.user?.email ?? "—"}</p>
                        </div>
                      </div>
                      <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/admin/providers/${provider.user_id}`}>
                        Manage
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Specialty</p>
                        <p className="mt-1 text-sm text-ink">{provider.specialty ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">License</p>
                        <p className="mt-1 text-sm text-ink">{provider.license_number ?? <span className="text-muted">—</span>}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Bio</p>
                        <p className="mt-1 line-clamp-2 text-sm text-ink">{provider.bio ?? <span className="text-muted">—</span>}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                      <p className="text-xs text-muted">Profile completeness</p>
                      <CompletenessBar filled={completeness} total={4} />
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
