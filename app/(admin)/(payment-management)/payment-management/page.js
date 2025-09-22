"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PaymentDashboard() {
  const [data, setData] = useState({ weeklyTotal: 0, monthlyTotal: 0, daily: [] });

  useEffect(() => {
    fetch("/api/payments/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-100">
      {/* Page heading */}
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-100 tracking-tight">
        Transaction Overview
      </h1>

      {/* Stats + chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly total */}
        <Card className="shadow-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
          <CardContent className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-400">Weekly Total</h2>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              LKR {data.weeklyTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Monthly total */}
        <Card className="shadow-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
          <CardContent className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-400">Monthly Total</h2>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              LKR {data.monthlyTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-xl col-span-1 md:col-span-3 bg-gray-900 border border-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">
              Payments (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.daily}>
                <XAxis
                  dataKey="_id"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
