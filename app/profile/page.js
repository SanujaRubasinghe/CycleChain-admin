"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminProfile() {
  const router = useRouter();

  const logout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const deleteAccount = async () => {
    if (confirm("Are you sure you want to delete your admin account?")) {
      await fetch("/api/admin", { method: "DELETE" });
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface p-10">
      <div className="card max-w-lg mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Admin Profile</h2>
        {/* admin details fetched from API */}
        <p className="text-subtext mb-4">Email: admin@example.com</p>
        <p className="text-subtext mb-6">Role: Admin</p>

        <button onClick={logout} className="btn btn-primary w-full mb-2">
          Logout
        </button>
        <button onClick={deleteAccount} className="btn btn-ghost w-full">
          Delete Account
        </button>
      </div>
    </div>
  );
}
