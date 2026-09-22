"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Custom Tooltip Component for Recharts (Adapts to Light & Dark Theme)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-rose-500/20 bg-white/95 dark:bg-[#1A0F13]/95 p-3 shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-stone-900 dark:text-rose-300 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-stone-900 dark:text-white">
              {entry.name.toLowerCase().includes("revenue") || entry.name.toLowerCase().includes("sales")
                ? `৳${Number(entry.value).toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Sales & Revenue Area Chart ── */
export function SalesAreaChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#332A2E" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="day"
          stroke="#78716C"
          tick={{ fill: "#A8A29E", fontSize: 11 }}
          axisLine={{ stroke: "#292524" }}
        />
        <YAxis
          stroke="#78716C"
          tick={{ fill: "#A8A29E", fontSize: 11 }}
          axisLine={{ stroke: "#292524" }}
          tickFormatter={(val) => `৳${val}`}
        />
        <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#F43F5E"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
        <Area
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorOrders)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Order Distribution Donut/Pie Chart ── */
export function OrderPieChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data.length > 0 ? data : [{ name: "No Orders", value: 1, color: "#94A3B8" }]}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="#161113" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ── Product Type Bar Chart ── */
export function ProductTypeBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#332A2E" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="name" stroke="#78716C" tick={{ fill: "#A8A29E", fontSize: 11 }} />
        <YAxis stroke="#78716C" tick={{ fill: "#A8A29E", fontSize: 11 }} />
        <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
        <Bar dataKey="count" name="Products Count" radius={[8, 8, 0, 0]}>
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
