"use client";

import { useEffect, useState } from "react";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/users/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data)
    return (
      <div className="p-10 text-white text-center">Loading analytics…</div>
    );

  const { roles, rides, productPayments, reservationPayments } = data;

  return (
    <div className="min-h-screen bg-gray-900 p-10">
      <h2 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Users by Role</h3>
          <UsersPieChart data={roles} />
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Monthly Rides</h3>
          <MonthlyBarChart data={rides.monthly} dataKey="rides" fillColor="#60a5fa" />
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Product Payments by Status</h3>
          <UsersPieChart data={productPayments.byStatus.map(s => ({ role: s.status, count: s.count }))} />
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Reservation Payments by Status</h3>
          <UsersPieChart data={reservationPayments.byStatus.map(s => ({ role: s.status, count: s.count }))} />
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Monthly Product Revenue</h3>
          <MonthlyBarChart data={productPayments.monthly} dataKey="total" fillColor="#34d399" />
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Monthly Reservation Revenue</h3>
          <MonthlyBarChart data={reservationPayments.monthly} dataKey="total" fillColor="#fbbf24" />
        </div>
      </div>
    </div>
  );
}

function UsersPieChart({ data }) {
  if (!data || data.length === 0) return null;

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
      <Tooltip
        contentStyle={{
          backgroundColor: "#1f2937",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
        }}
      />
      <Legend wrapperStyle={{ color: "#fff" }} iconType="circle" />
    </PieChart>
  );
}

function MonthlyBarChart({ data, dataKey, fillColor }) {
  if (!data || data.length === 0) return null;

  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis
        dataKey="month"
        stroke="#9ca3af"
        tick={{ fontSize: 12, fill: "#d1d5db" }}
      />
      <YAxis
        stroke="#9ca3af"
        tick={{ fontSize: 12, fill: "#d1d5db" }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "#1f2937",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
        }}
      />
      <Bar dataKey={dataKey} fill={fillColor} radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}
