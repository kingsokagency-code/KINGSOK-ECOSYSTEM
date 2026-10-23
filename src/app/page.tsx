import React from "react";
import Link from "next/link";
import {
  Shield,
  Home,
  Building2,
  KeyRound,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function PublicEcosystemHome() {
  const sectors = [
    {
      id: "accommodation",
      title: "Accommodation Sector",
      tagline: "Active Operational Portal",
      description:
        "Field scouting for student lodges, caretaker & president connections, fresher housing support, and area controller operations.",
      icon: Home,
      status: "active",
      href: "/accommodation",
      badge: "ACTIVE NOW",
      metrics: "500 Student Goal • 3 Core Roles • Real-Time Field Log",
      accent: "from-emerald-700 to-emerald-900",
      buttonText: "Enter Accommodation Portal",
    },
    {
      id: "properties",
      title: "Properties Sector",
      tagline: "Phase 3 Development",
      description:
        "Land acquisition, site development, structured property investments, and physical estate oversight.",
      icon: Building2,
      status: "upcoming",
      href: "#",
      badge: "NEXT PHASE",
      metrics: "Sites & Developments • Inactive",
      accent: "from-slate-700 to-slate-800",
      buttonText: "Coming Soon",
    },
    {
      id: "rentals",
      title: "Rentals Sector",
      tagline: "Commercial Operations",
      description:
        "Short-term rentals, commercial halls, equipment leasing, and event logistics across university and town areas.",
      icon: KeyRound,
      status: "upcoming",
      href: "#",
      badge: "UPCOMING",
      metrics: "Shortlets & Equipment • Inactive",
      accent: "from-slate-700 to-slate-800",
      buttonText: "Coming Soon",
    },
    {
      id: "food",
      title: "Food & Catering Sector",
      tagline: "Nutritional Logistics",
      description:
        "Reliable daily food delivery, student hostel catering, and event nutritional support.",
      icon: UtensilsCrossed,
      status: "upcoming",
      href: "#",
      badge: "UPCOMING",
      metrics: "Hostel Meal Plans • Inactive",
      accent: "from-slate-700 to-slate-800",
      buttonText: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kingsok-100 flex items-center justify-center text-kingsok-800 border border-kingsok-200">
              <Shield className="w-6 h-6 text-kingsok-700" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                KINGSOK APEX ENTERPRISE
              </span>
              <span className="text-[11px] text-kingsok-700 font-semibold uppercase tracking-wider block -mt-0.5">
                Workforce & Operational Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/accommodation"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-kingsok-700 hover:bg-kingsok-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              <span>Enter Accommodation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            KINGSOK Foundation Charter
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Not Primarily a Business. <br />
            <span className="text-kingsok-700">A Formation Ground.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Where hidden potential is called out, weak structures are replaced with inner order, and people are formed to carry real responsibility.
          </p>

          {/* Foundation Anchor Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-kingsok-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Identity Before Temptation</span>
                <span className="text-slate-500">When identity is strong, shortcuts lose authority.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-kingsok-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Systems Form Competence</span>
                <span className="text-slate-500">Talent without structure decays. Order produces results.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-kingsok-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Truth Is Not Negotiated</span>
                <span className="text-slate-500">We do not bend principles for comfort or numbers.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector Selection Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-kingsok-700 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Operational Portals</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Ecosystem Sectors
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Select a sector portal to view current running goals, operational strategies, or sign in to your worker dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isActive = sector.status === "active";

            return (
              <div
                key={sector.id}
                className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-500/10 hover:border-emerald-500"
                    : "bg-slate-100/70 border-slate-200/80 opacity-80"
                }`}
              >
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${sector.accent} shadow-sm`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {sector.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {sector.title}
                    </h3>
                    <div className="text-xs font-semibold text-kingsok-700 mt-0.5">
                      {sector.tagline}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {sector.description}
                  </p>

                  <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                    {sector.metrics}
                  </div>
                </div>

                <div className="p-4 sm:px-8 sm:py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  {isActive ? (
                    <Link
                      href={sector.href}
                      className="w-full py-2.5 px-4 bg-kingsok-700 hover:bg-kingsok-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{sector.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-slate-200 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed text-center"
                    >
                      {sector.buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Help for Workers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Are you an Area Controller, Hotliner, or Customer Rep?
              </h4>
              <p className="text-xs text-slate-500">
                Enter the Accommodation portal to access your field tools, record lodges, track fresher leads, and see your performance points.
              </p>
            </div>
          </div>

          <Link
            href="/accommodation"
            className="flex-shrink-0 px-4 py-2 text-xs font-bold text-kingsok-800 bg-kingsok-100 hover:bg-kingsok-200 rounded-xl transition-colors"
          >
            Go to Accommodation Portal &rarr;
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>KINGSOK Apex Enterprise Ltd &bull; Workforce System v1.3 &bull; All field data audited and protected.</p>
      </footer>
    </div>
  );
}
