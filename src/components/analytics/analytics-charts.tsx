"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  RadialBarChart, RadialBar
} from "recharts";

import { Card } from "@/components/ui/card";

const COLORS = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  completed: "#3b82f6",
  cancelled: "#ef4444"
};

const SOFT_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

// -- Appointment Status Donut --
export function AppointmentStatusChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">Appointment status distribution</h3>
      <div className="mt-4 h-[260px]">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">No appointment data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e4e9f0", fontSize: "13px" }}
                formatter={(value: any, name: any) => [`${value} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-xs text-muted">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// -- Daily Activity Area Chart --
export function DailyActivityChart({ data }: { data: { day: string; appointments: number; records: number; prescriptions: number }[] }) {
  const hasData = data.some((d) => d.appointments > 0 || d.records > 0 || d.prescriptions > 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">Daily activity (last 14 days)</h3>
      <div className="mt-4 h-[260px]">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">No recent activity to chart</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e4e9f0", fontSize: "13px" }}
              />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} name="Appointments" />
              <Area type="monotone" dataKey="records" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} name="Records" />
              <Area type="monotone" dataKey="prescriptions" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} name="Prescriptions" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// -- Provider Workload Bar Chart --
export function ProviderWorkloadChart({ data }: { data: { name: string; appointments: number; notes: number; prescriptions: number }[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">Provider workload comparison</h3>
      <div className="mt-4 h-[300px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">No provider data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e4e9f0", fontSize: "13px" }}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted">{v}</span>} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Appointments" />
              <Bar dataKey="notes" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Notes" />
              <Bar dataKey="prescriptions" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Prescriptions" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// -- User Role Distribution Donut --
export function UserRoleChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">User distribution by role</h3>
      <div className="mt-4 h-[260px]">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">No users yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={SOFT_COLORS[i % SOFT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e4e9f0", fontSize: "13px" }}
                formatter={(value: any, name: any) => [`${value} users`, name]}
              />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs capitalize text-muted">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// -- Completion Rate Gauge --
export function CompletionGauge({ rate, label }: { rate: number; label: string }) {
  const data = [{ name: label, value: rate, fill: rate >= 70 ? "#10b981" : rate >= 40 ? "#f59e0b" : "#ef4444" }];

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">{label}</h3>
      <div className="mt-2 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={data}>
            <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className="mt-[-40px] text-center text-3xl font-bold text-ink">{rate}%</p>
      </div>
    </Card>
  );
}
