"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Sign in</h2>

        <form className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" placeholder="you@example.com" className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="input flex-1"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
        </form>

        <p className="text-sm text-subtext mt-6 text-center">
          Don’t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
