import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, CheckCircle, UserCheck, Lock, Database } from "lucide-react";
import SignOutButton from "./SignOutButton";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-kingsok-100 flex items-center justify-center text-kingsok-800 border border-kingsok-200">
              <Shield className="w-5 h-5 text-kingsok-700" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">
                KINGSOK
              </span>
              <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">
                Workforce System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600 hidden sm:inline-block font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Task 1A Foundation Active
              </h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                You are securely signed in to the KINGSOK staging environment. Session protection, email authentication, and the database audit engine are operational.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-kingsok-700 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Authentication
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Invite-only email auth with PKCE password recovery. Public signup disabled.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
              <Database className="w-5 h-5 text-kingsok-700 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Audit Log Engine
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Immutable, append-only trigger tracking all configurable data modifications.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
              <Lock className="w-5 h-5 text-kingsok-700 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Security Boundaries
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Staging and live environments completely isolated. Client RLS lockdown enforced.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>
            <strong>Task 1B Scope Pending:</strong> Profiles, Org Units, Work Roles, Permissions, Invitations, and Administration screens will be provisioned in Task 1B after Okoye&apos;s review.
          </span>
          <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-300">
            ENV: {process.env.NEXT_PUBLIC_APP_ENV || "staging"}
          </span>
        </div>
      </div>
    </main>
  );
}
