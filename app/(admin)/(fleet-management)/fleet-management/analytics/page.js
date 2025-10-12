"use client";
import React, { useEffect, useState, useRef } from "react";
import { FiBarChart2, FiTrendingUp, FiUsers, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import AnalyticsPageLoader from "../../components/AnalyticsPageLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  // Monthly usage
  const [usage, setUsage] = useState({ labels: [], data: [] });
  const [usageLoading, setUsageLoading] = useState(true);

  // Status distribution
  const [status, setStatus] = useState({ labels: [], data: [] });
  const [statusLoading, setStatusLoading] = useState(true);

  // Active sessions (polled)
  const [activeSessions, setActiveSessions] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);

  // Top users
  const [topUsers, setTopUsers] = useState([]);
  const [topUsersLoading, setTopUsersLoading] = useState(true);

  const activePollRef = useRef(null);

  async function fetchJson(url, setData, setLoading, setError) {
    setLoading(true);
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJson("/api/fleet/analytics/overview", setOverview, setOverviewLoading, setOverviewError);
    fetchJson("/api/fleet/analytics/monthly-usage?months=7", setUsage, setUsageLoading, () => {});
    fetchJson("/api/fleet/analytics/status-distribution", setStatus, setStatusLoading, () => {});
    fetchJson("/api/fleet/analytics/top-users?days=30", setTopUsers, setTopUsersLoading, () => {});
    const poll = async () => {
      setActiveLoading(true);
      try {
        const res = await fetch("/api/fleet/analytics/active-sessions", { cache: "no-cache" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const j = await res.json();
        setActiveSessions(j.sessions || []);
      } catch (e) {
        console.error("Active sessions fetch failed:", e);
      } finally {
        setActiveLoading(false);
      }
    };

    // run immediately then set interval
    poll();
    activePollRef.current = setInterval(poll, 10_000);

    return () => {
      if (activePollRef.current) clearInterval(activePollRef.current);
    };
  }, []);

  const downloadPDF = async () => {
    try {
      const res = await fetch("/api/fleet/reports/monthly");
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; 
      a.download = `CycleChain_Monthly_Report_${dateStr}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    }
  };

  // Build chart datasets
  const usageData = {
    labels: usage.labels || [],
    datasets: [
      {
        label: "Bike Rentals",
        data: usage.data || [],
        backgroundColor: "#06B6D4",
        borderRadius: 6,
      },
    ],
  };

  const statusData = {
    labels: status.labels || ["Available", "In Use", "Maintenance", "Offline"],
    datasets: [
      {
        data: status.data || [],
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#cc0000"],
        borderWidth: 0,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#D1D5DB" },
      },
    },
    scales: {
      x: { ticks: { color: "#9CA3AF" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#9CA3AF" }, grid: { color: "#374151" } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "right", labels: { color: "#D1D5DB" } } },
  };

  const stats = [
    { title: "Total Rentals", value: overview ? overview.totalRentals : "—", icon: <FiBarChart2 />, change: "+12%" },
    { title: "Active Users", value: overview ? overview.activeUsers : "—", icon: <FiUsers />, change: "+8%" },
    { title: "Avg. Ride Time", value: overview ? `${overview.avgRideTime} min` : "—", icon: <FiClock />, change: "+5%" },
    { title: "Revenue", value: overview ? `LKR ${Number(overview.revenue || 0).toLocaleString()}` : "—", icon: <FiTrendingUp />, change: "+18%" },
  ];

  if (overviewLoading) {
    return <AnalyticsPageLoader/>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Updated: {new Date().toLocaleString()}</div>
            <button
              onClick={downloadPDF}
              className="bg-cyan-500 text-white px-3 py-1.5 rounded hover:bg-cyan-600 text-sm"
            >
              Download Monthly Report
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{stat.icon}</div>
              </div>
              {/* <div className="mt-4 flex items-center text-sm text-green-400">
                <span className="font-medium">{stat.change}</span>
                <span className="ml-2 text-gray-400">from last month</span>
              </div> */}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Monthly Usage</h2>
              {usageLoading ? <span className="text-sm text-gray-400">Loading...</span> : null}
            </div>
            <div className="h-80">
              <Bar data={usageData} options={barOptions} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Bike Status Distribution</h2>
              {statusLoading ? <span className="text-sm text-gray-400">Loading...</span> : null}
            </div>
            <div className="h-80">
              <Pie data={statusData} options={pieOptions} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Rentals</h2>
              <div className="text-sm text-gray-400">{activeLoading ? "Refreshing…" : `${activeSessions.length} active`}</div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeLoading && activeSessions.length === 0 ? (
                <div className="text-sm text-gray-400">Loading active sessions…</div>
              ) : activeSessions.length === 0 ? (
                <div className="text-sm text-gray-400">No active sessions right now.</div>
              ) : (
                activeSessions.map((s) => (
                  <div key={s.session_id} className="flex items-center justify-between bg-gray-900/20 p-3 rounded-md">
                    <div>
                      <div className="text-white font-medium">{s.session_id}</div>
                      <div className="text-sm text-gray-400">User: {s.user_id} • Bike: {s.bike_id}</div>
                    </div>
                    <div className="text-sm text-gray-300">{s.activeMinutes != null ? `${s.activeMinutes}m` : "—"}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Top Riders (30d)</h3>
            <div className="space-y-3">
              {topUsersLoading ? (
                <div className="text-sm text-gray-400">Loading top users…</div>
              ) : topUsers.topUsers.length === 0 ? (
                <div className="text-sm text-gray-400">No data</div>
              ) : (
                topUsers.topUsers.map((t) => (
                  <div key={t.user_id} className="flex items-center justify-between bg-gray-900/20 p-3 rounded-md">
                    <div>
                      <div className="text-white">{(t.user && t.user.name) || t.user_id}</div>
                      <div className="text-sm text-gray-400">{t.user?.email || ""}</div>
                    </div>
                    <div className="text-sm text-gray-300">{t.count} rides</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
