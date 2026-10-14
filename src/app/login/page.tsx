"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const notice = searchParams.get("notice");
    const message = searchParams.get("message");

    if (notice === "signup_disabled" || message === "invite_only") {
      setInfoMessage(
        "The KINGSOK Workforce System is strictly invite-only. Public registration is not permitted. Please contact your supervisor or administrator for an invitation."
      );
    } else if (searchParams.get("reset") === "success") {
      setInfoMessage("Your password has been successfully reset. Please sign in with your new password.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Map raw errors to friendly, helpful messages
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
          setErrorMessage("The email or password you entered is incorrect. Please check your credentials and try again.");
        } else if (msg.includes("email not confirmed")) {
          setErrorMessage("This email address has not been confirmed yet. Please verify your email or contact support.");
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
          setErrorMessage("Too many login attempts. Please wait a few moments before trying again.");
        } else {
          setErrorMessage("Unable to sign in at this time. Please check your network connection and try again.");
        }
        return;
      }

      if (data.user) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMessage("A connection error occurred. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-kingsok-100 text-kingsok-800 mb-4 shadow-sm border border-kingsok-200">
          <Shield className="w-7 h-7 text-kingsok-700" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          KINGSOK Workforce
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Formation Ground & Operational Management
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        {/* Informational Message */}
        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@kingsok.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kingsok-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-kingsok-700 hover:text-kingsok-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kingsok-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-kingsok-700 hover:bg-kingsok-800 text-white font-medium text-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kingsok-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Notice */}
      <p className="text-center text-xs text-slate-400 mt-8">
        Strictly invite-only. System access is monitored and audited.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
