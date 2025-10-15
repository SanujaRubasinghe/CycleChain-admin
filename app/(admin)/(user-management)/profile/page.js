"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminProfile() {
  const router = useRouter();
  const {data: session} = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(session?.user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const logout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUsername(session?.user?.username || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (newPassword && newPassword !== confirmPassword) {
        throw new Error("New passwords don't match");
      }

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      // Refresh session to get updated data
      window.location.reload();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(session?.user?.username || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your admin account? This cannot be undone.")) return;
    
    if (!confirm("This will permanently delete your account. Are you absolutely sure?")) return;

    try {
      const res = await fetch("/api/users/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
      
      alert("Account deleted successfully. You will be logged out.");
      await signOut({ callbackUrl: "/register" });
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Admin Profile</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-300 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isEditing ? (
          <>
            {/* Admin Details */}
            <div className="mb-6 space-y-2">
              <p className="text-gray-300"><span className="font-medium">Username:</span> {session?.user?.username || "Not set"}</p>
              <p className="text-gray-300"><span className="font-medium">Email:</span> {session?.user?.email}</p>
              <p className="text-gray-300"><span className="font-medium">Role:</span> Admin</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleEdit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
              >
                Logout
              </button>
              <button
                onClick={deleteAccount}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                Delete Account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300 font-medium">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 font-medium">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to change password"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 font-medium">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave empty to keep current password"
                minLength={6}
              />
            </div>

            {newPassword && (
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
