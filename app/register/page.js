"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to register admin");

      // success: go to /login (change to dashboard if you auto-login)
      window.location.href = "/login";
    } catch (e) {
      setErr(e.message || "Failed to register admin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface grid place-items-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-white">Admin Register</h1>
        <p className="text-subtext text-center mt-1">
          Create an administrator account for the Cycle Chain dashboard.
        </p>

        {err && <div className="mt-4 text-red-400 text-center">{err}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin01"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                className="input flex-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => setShow((s) => !s)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-subtext mt-1">Minimum 6 characters.</p>
          </div>

          <button className="btn-primary w-full" disabled={saving}>
            {saving ? "Creating…" : "Create admin account"}
          </button>
        </form>

        <p className="text-sm text-subtext mt-6 text-center">
          Already an admin? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
