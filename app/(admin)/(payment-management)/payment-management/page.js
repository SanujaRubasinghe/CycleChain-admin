"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PaymentDashboard() {
  const [data, setData] = useState({ weeklyTotal: 0, monthlyTotal: 0, daily: [] });

  useEffect(() => {
    fetch("/api/payment/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-lg">
        <CardContent>
          <h2 className="text-xl font-semibold">Weekly Total</h2>
          <p className="text-2xl">${data.weeklyTotal}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent>
          <h2 className="text-xl font-semibold">Monthly Total</h2>
          <p className="text-2xl">${data.monthlyTotal}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg col-span-1 md:col-span-3">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Payments (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
