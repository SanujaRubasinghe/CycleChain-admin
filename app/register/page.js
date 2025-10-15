"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nic, setNic] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, nic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to register admin");

      // Redirect to login page after successful registration
      window.location.href = "/auth/login?message=Registration successful. Please log in.";
    } catch (e) {
      setErr(e.message || "Failed to register admin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 grid place-items-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-white">
          Admin Register
        </h1>
        <p className="text-gray-400 text-center mt-1">
          Create an administrator account for the Cycle Chain dashboard.
        </p>

        {err && (
          <div className="mt-4 text-red-400 text-center font-medium">{err}</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">Username</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin01"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          {/* NIC */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">NIC</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              placeholder="e.g. 200012345678"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-gray-300 font-medium">Password</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition text-sm font-medium"
                onClick={() => setShow((s) => !s)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
            disabled={saving}
          >
            {saving ? "Creating…" : "Create admin account"}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
}
