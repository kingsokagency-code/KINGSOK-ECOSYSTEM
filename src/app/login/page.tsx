"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  switchCurrentUser,
  getUsers,
  registerStaffApplicant,
  verifyAndLoginAdmin,
  verifyAndLoginStaff,
  WorkerRole,
} from "@/lib/accommodation-service";
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  Radio,
  Headphones,
  ShieldAlert,
  UserPlus,
  LogIn,
  KeyRound,
  MapPin,
  Sparkles,
} from "lucide-react";

type AuthTab = "staff_signin" | "staff_register" | "admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab: "staff_signin", "staff_register", or "admin"
  const [authTab, setAuthTab] = useState<AuthTab>("staff_signin");

  // Staff Registration Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [zonePreference, setZonePreference] = useState("Hilltop Zone");
  const [desiredRole, setDesiredRole] = useState("area_controller");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin Login Fields
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const portal = searchParams.get("portal");
    const mode = searchParams.get("mode");

    if (portal === "admin") {
      setAuthTab("admin");
    } else if (portal === "staff" && mode === "register") {
      setAuthTab("staff_register");
    } else if (mode === "register") {
      setAuthTab("staff_register");
    } else {
      setAuthTab("staff_signin");
    }

    if (searchParams.get("notice") === "pending_approval") {
      setInfoMessage("Your staff profile is registered and pending Admin (Okoye) role assignment.");
    } else if (searchParams.get("reset") === "success") {
      setInfoMessage("Your password has been successfully reset. Please sign in.");
    }
  }, [searchParams]);

  const getWorkspaceForRole = (role: WorkerRole) => {
    switch (role) {
      case "admin":
        return "/accommodation/admin";
      case "area_controller":
        return "/accommodation/controller";
      case "hotliner":
        return "/accommodation/hotliner";
      case "customer_rep":
        return "/accommodation/customer-rep";
      default:
        return "/accommodation";
    }
  };

  // Staff Sign In Handler
  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const supabase = createClient();

      // Attempt Supabase Auth
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      } catch {
        // Fallback gracefully
      }

      // Check workforce database
      const user = await verifyAndLoginStaff({ email: cleanEmail, password });
      
      if (user.status === "pending_approval" || user.roles.includes("pending")) {
        router.push("/accommodation");
      } else {
        const target = getWorkspaceForRole(user.roles[0] || "area_controller");
        router.push(target);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Invalid credentials. If you are a new worker, please register using the 'Staff Registration' tab."
      );
    } finally {
      setLoading(false);
    }
  };

  // Staff Registration Handler
  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your active phone number.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const supabase = createClient();

      // 1. Create account in Supabase auth (if available)
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              role: desiredRole,
            },
          },
        });
      } catch (authErr) {
        console.warn("Supabase auth signup notice:", authErr);
      }

      // 2. Register staff applicant into KINGSOK Workforce service
      const newStaff = await registerStaffApplicant({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        whatsapp_phone: whatsappPhone.trim() || phone.trim(),
        zone_preference: zonePreference,
        desired_role: desiredRole,
      });

      // 3. Switch current user to the new staff applicant
      await switchCurrentUser(newStaff.id);

      // 4. Route to accommodation home where pending approval message is displayed
      router.push("/accommodation");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to register staff profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Admin Command Portal Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!adminPasscode.trim()) {
      setErrorMessage("Please enter the Admin passcode or password.");
      return;
    }

    setLoading(true);
    try {
      const admin = await verifyAndLoginAdmin({
        email: adminEmail,
        passcodeOrPassword: adminPasscode,
      });

      router.push("/accommodation/admin");
    } catch (err: any) {
      setErrorMessage(
        err.message || "Invalid Admin credentials. Please check your passcode and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick staff profile switcher for active team members (Excludes Admin)
  const handleQuickStaffLogin = async (userId: string, targetPath: string) => {
    try {
      await switchCurrentUser(userId);
      router.push(targetPath);
    } catch {
      router.push(targetPath);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 font-sans">
      {/* Top Breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ecosystem Portal</span>
        </Link>

        {authTab === "admin" ? (
          <button
            type="button"
            onClick={() => {
              setAuthTab("staff_signin");
              setErrorMessage(null);
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Staff Portal &rarr;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuthTab("admin");
              setErrorMessage(null);
            }}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Admin Portal</span>
          </button>
        )}
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-xs border ${
            authTab === "admin"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {authTab === "admin" ? (
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          ) : (
            <Shield className="w-7 h-7 text-emerald-600" />
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {authTab === "admin" ? "Admin Command Portal" : "KINGSOK Workforce"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {authTab === "admin"
            ? "Restricted Executive Access & Role Assignment"
            : "Ground-Truth Field Team & Client Operations"}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-7 space-y-5">
        {/* Three Portal Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthTab("staff_signin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              authTab === "staff_signin"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-3 h-3 text-emerald-600" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab("staff_register");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              authTab === "staff_register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-3 h-3 text-emerald-600" />
            <span>Register</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab("admin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              authTab === "admin"
                ? "bg-amber-100 text-amber-900 shadow-xs border border-amber-300"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="w-3 h-3 text-amber-600" />
            <span>Admin</span>
          </button>
        </div>

        {/* Informational Message */}
        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: STAFF SIGN IN */}
        {/* ------------------------------------------------------------------ */}
        {authTab === "staff_signin" && (
          <form onSubmit={handleStaffSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="e.g. emeka@kingsok.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Staff</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setAuthTab("staff_register")}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
              >
                New staff member? <span className="font-bold text-emerald-700 underline">Register profile here</span>
              </button>
            </div>

            {/* Quick Demo Access for Field Workers (Excludes Admin) */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Quick Team Access (Field Staff)
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickStaffLogin("u-emeka", "/accommodation/controller")}
                  className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-slate-900 text-left transition-colors cursor-pointer"
                >
                  <span className="text-[9px] uppercase font-bold text-emerald-800 block">Controller</span>
                  <span className="font-bold text-xs truncate block">Emeka</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStaffLogin("u-chioma", "/accommodation/hotliner")}
                  className="p-2 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-slate-900 text-left transition-colors cursor-pointer"
                >
                  <span className="text-[9px] uppercase font-bold text-sky-800 block">Hotliner</span>
                  <span className="font-bold text-xs truncate block">Chioma</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStaffLogin("u-kalu", "/accommodation/customer-rep")}
                  className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-slate-900 text-left transition-colors cursor-pointer"
                >
                  <span className="text-[9px] uppercase font-bold text-amber-800 block">Customer Rep</span>
                  <span className="font-bold text-xs truncate block">Kalu</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: STAFF REGISTRATION */}
        {/* ------------------------------------------------------------------ */}
        {authTab === "staff_register" && (
          <form onSubmit={handleStaffRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ebuka Kingsley"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+234 803 000 0000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="Same or WhatsApp"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Desired Role
                </label>
                <select
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="area_controller">🏢 Area Controller</option>
                  <option value="hotliner">📡 Hotliner</option>
                  <option value="customer_rep">🎧 Customer Rep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Preferred Territory
                </label>
                <select
                  value={zonePreference}
                  onChange={(e) => setZonePreference(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                >
                  <option value="Hilltop Zone">Hilltop Zone</option>
                  <option value="Odim Gate Zone">Odim Gate Zone</option>
                  <option value="Ofulonu Zone">Ofulonu Zone</option>
                  <option value="Green House Zone">Green House Zone</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register Profile & Await Role</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Upon registering, your profile is routed to Admin (Okoye) for territory and quota assignment.
            </p>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: ADMIN COMMAND PORTAL */}
        {/* ------------------------------------------------------------------ */}
        {authTab === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Restricted to Authorized Executive Leadership (Okoye).</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  placeholder="Enter authorized admin email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Admin Passcode / Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Unlock Admin Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Notice */}
      <p className="text-center text-xs text-slate-400 mt-6">
        KINGSOK Ecosystem &bull; Character, Systems, and Absolute Ground Truth.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
