"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from "recharts";

import { Card } from "@/components/ui/card";

// -- Compact Donut for status/role breakdown --
export function MiniDonut({ title, data, height = 200 }: {
  title: string;
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div style={{ height }} className="mt-3">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e4e9f0", fontSize: "12px", padding: "6px 10px" }}
                formatter={(v: any, n: any) => [`${v} (${total > 0 ? Math.round((Number(v) / total) * 100) : 0}%)`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.filter((d) => d.value > 0).map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] text-muted">{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// -- Mini bar chart for comparing counts --
export function MiniBarChart({ title, data, height = 200 }: {
  title: string;
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div style={{ height }} className="mt-3">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e4e9f0", fontSize: "12px" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// -- Sparkline area for trends --
export function SparklineCard({ title, value, subtitle, data, color = "#3b82f6", height = 80 }: {
  title: string;
  value: string | number;
  subtitle: string;
  data: { v: number }[];
  color?: string;
  height?: number;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{subtitle}</p>
      <div style={{ height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
