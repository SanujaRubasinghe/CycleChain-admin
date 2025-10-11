"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccess(message);
    }
  }, [searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard", 
    });
    if (res?.error) {
      setErr("Login failed: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 grid place-items-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-white">
          Admin Login
        </h1>
        <p className="text-gray-400 text-center mt-1">
          Access the Cycle Chain dashboard.
        </p>

        {success && (
          <div className="mt-4 text-green-400 text-center font-medium">{success}</div>
        )}

        {err && (
          <div className="mt-4 text-red-400 text-center font-medium">{err}</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div>
            <label className="block mb-1 text-gray-300 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account?</span>{" "}
          <Link href="/register" className="text-green-400 hover:text-green-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 grid place-items-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <div className="text-center text-white">Loading...</div>
      </div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}



