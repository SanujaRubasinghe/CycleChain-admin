"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/store";

  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk(""); setLoading(true);

    try {
      // 1) call our register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setOk("Account created! Signing you in…");

      // 2) auto sign-in with credentials
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (login?.error) {
        // fallback: go to login page
        router.push("/login");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Create account</h2>

        {err && <div className="p-3 border border-red-500/40 text-red-400 rounded mb-3">{err}</div>}
        {ok &&  <div className="p-3 border border-green-500/40 text-green-400 rounded mb-3">{ok}</div>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              placeholder="e.g. bunny123"
              className="input"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input flex-1"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
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

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-subtext mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
