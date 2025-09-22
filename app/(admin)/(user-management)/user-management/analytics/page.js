"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171"];
const DATE_RANGES = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/analytics?range=${dateRange}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading || !data)
    return <div className="p-10 text-white text-center">Loading analytics…</div>;

  const { roles, rides, productPayments, reservationPayments } = data;

  return (
    <div className="min-h-screen bg-gray-900 p-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex gap-3">
          <select
            className="bg-gray-800 text-white p-2 rounded"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchAnalytics}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard title="Users by Role">
          <UsersPieChart data={roles} />
        </ChartCard>

        <ChartCard title="Monthly Rides">
          <MonthlyBarChart data={rides.monthly} dataKey="rides" fillColor="#60a5fa" />
        </ChartCard>

        <ChartCard title="Product Payments by Status">
          <UsersPieChart data={productPayments.byStatus.map(s => ({ role: s.status, count: s.count }))} />
        </ChartCard>

        <ChartCard title="Reservation Payments by Status">
          <UsersPieChart data={reservationPayments.byStatus.map(s => ({ role: s.status, count: s.count }))} />
        </ChartCard>

        <ChartCard title="Monthly Product Revenue">
          <MonthlyBarChart data={productPayments.monthly} dataKey="total" fillColor="#34d399" />
        </ChartCard>

        <ChartCard title="Monthly Reservation Revenue">
          <MonthlyBarChart data={reservationPayments.monthly} dataKey="total" fillColor="#fbbf24" />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function UsersPieChart({ data }) {
  if (!data || data.length === 0) return <div className="text-white">No data</div>;

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="count"
        nameKey="role"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={{ fill: "#ffffff", fontSize: 12 }}
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} />
      <Legend wrapperStyle={{ color: "#fff" }} iconType="circle" />
    </PieChart>
  );
}

function MonthlyBarChart({ data, dataKey, fillColor }) {
  if (!data || data.length === 0) return <div className="text-white">No data</div>;

  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12, fill: "#d1d5db" }} />
      <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: "#d1d5db" }} />
      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8, color: "#fff" }} />
      <Bar dataKey={dataKey} fill={fillColor} radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}
