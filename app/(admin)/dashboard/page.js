"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const cards = [
  {
    href: "/admin/user-management",
    title: "User Management",
    desc: "View and manage all users",
    icon: "👥",
    color: "from-blue-500 to-cyan-500"
  },
  {
    href: "/store",
    title: "Store Management",
    desc: "Manage products and inventory",
    icon: "🛍️",
    color: "from-purple-500 to-pink-500"
  },
  {
    href: "/admin/profile",
    title: "Admin Profile",
    desc: "Edit your account settings",
    icon: "⚙️",
    color: "from-gray-500 to-gray-600"
  },
  {
    href: "/admin/analytics",
    title: "Analytics",
    desc: "View detailed analytics and reports",
    icon: "📊",
    color: "from-teal-500 to-green-500"
  },
  {
    href: "/reports",
    title: "Report Generation",
    desc: "Generate and download reports",
    icon: "📄",
    color: "from-amber-500 to-yellow-500"
  },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBikes: 0,
    totalRides: 0,
    totalRevenue: 0,
    loading: true
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, bikesRes, ridesRes, revenueRes] = await Promise.all([
          fetch("/api/users").catch(() => ({ json: () => [] })),
          fetch("/api/fleet/bikes").catch(() => ({ json: () => [] })),
          fetch("/api/fleet/analytics/overview").catch(() => ({ json: () => ({ totalRides: 0 }) })),
          fetch("/api/payments/analytics").catch(() => ({ json: () => ({ totalRevenue: 0 }) }))
        ]);

        const [users, bikes, ridesData, revenueData] = await Promise.all([
          usersRes.json(),
          bikesRes.json(),
          ridesRes.json(),
          revenueRes.json()
        ]);

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalBikes: Array.isArray(bikes) ? bikes.length : 0,
          totalRides: ridesData.totalRides || 0,
          totalRevenue: revenueData.totalRevenue || 0,
          loading: false
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Welcome back, {session?.user?.username || "Admin"}!</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">
                  {stats.loading ? "..." : stats.totalUsers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Bikes</p>
                <p className="text-3xl font-bold text-white">
                  {stats.loading ? "..." : stats.totalBikes}
                </p>
              </div>
              <div className="text-4xl">🚴</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Rides</p>
                <p className="text-3xl font-bold text-white">
                  {stats.loading ? "..." : stats.totalRides}
                </p>
              </div>
              <div className="text-4xl">🏃</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  {stats.loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Admin Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={card.href}
                  className={`block rounded-2xl p-6 backdrop-blur-lg bg-white/5 border border-white/10 shadow-lg
                             hover:shadow-xl transition-all duration-300 group`}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{card.icon}</div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                      <span className="text-white text-xl">→</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {card.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔄</div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-gray-400">Live data synchronization</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure Access</h3>
              <p className="text-gray-400">Admin-only dashboard</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-400">Comprehensive insights</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
