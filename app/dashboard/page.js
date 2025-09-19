"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/store" className="card p-6 hover:bg-surface/70">
            <h2 className="text-xl font-semibold text-white">Manage Store</h2>
            <p className="text-subtext">Add, edit, or delete items</p>
          </Link>
          <Link href="/users" className="card p-6 hover:bg-surface/70">
            <h2 className="text-xl font-semibold text-white">Manage Users</h2>
            <p className="text-subtext">View and remove user profiles</p>
          </Link>
          <Link href="/profile" className="card p-6 hover:bg-surface/70">
            <h2 className="text-xl font-semibold text-white">Admin Profile</h2>
            <p className="text-subtext">Edit your account or logout</p>
          </Link>
          <Link href="/analytics" className="card p-6 hover:bg-surface/70">
            <h2 className="text-xl font-semibold text-white">Analytics</h2>
            <p className="text-subtext">User stats, rides & sales</p>
          </Link>
          <Link href="/reports" className="card p-6 hover:bg-surface/70">
            <h2 className="text-xl font-semibold text-white">Reports</h2>
            <p className="text-subtext">Generate and export reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
