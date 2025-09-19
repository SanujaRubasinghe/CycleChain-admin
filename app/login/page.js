"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard", // ✅ after login go to dashboard
    });
    if (res?.error) {
      setErr("Login failed: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface grid place-items-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-white">Admin Login</h1>
        <p className="text-subtext text-center mt-1">Access the Cycle Chain dashboard.</p>

        {err && <div className="mt-4 text-red-400 text-center">{err}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary w-full">Sign In</button>
        </form>
      </div>
    </div>
  );
}
