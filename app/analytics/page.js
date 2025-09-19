"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-10 text-white">Loading analytics…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface p-10">
      <h2 className="text-2xl font-semibold text-white mb-6">Analytics</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie chart for users */}
        <div className="card p-6">
          <h3 className="text-lg text-white mb-4">Users by Role</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={data.roles}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              {data.roles.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Bar chart for rides */}
        <div className="card p-6">
          <h3 className="text-lg text-white mb-4">Monthly Rides</h3>
          <BarChart width={400} height={300} data={data.monthlyRides}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rides" fill="#60a5fa" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
