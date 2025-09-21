"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { useSession } from "next-auth/react";

export default function AdminProfile() {
  const router = useRouter();
  const {data: session} = useSession()

  const logout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const deleteAccount = async () => {
    if (confirm("Are you sure you want to delete your admin account?")) {
      await fetch("/api/admin", { method: "DELETE" });
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Admin Profile</h2>

        {/* Admin Details */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-300"><span className="font-medium">Email:</span> {session.user.email}</p>
          <p className="text-gray-300"><span className="font-medium">Role:</span> Admin</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={logout}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
          >
            Logout
          </button>
          <button
            onClick={deleteAccount}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-500 rounded-lg font-semibold transition border border-gray-600"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
