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
  CheckCircle2,
  Users,
  User,
  Award,
  ClipboardList,
  Target,
  Headphones,
  Compass,
  Coins,
} from "lucide-react";

export default function PublicEcosystemHome() {
  const sectors = [
    {
      id: "accommodation",
      title: "Accommodation Sector",
      tagline: "Active Operational Portal",
      description:
        "On-the-ground lodge scouting, caretaker and president intel, vacating final-year & transition student tracking, and dedicated fresher placement.",
      icon: Home,
      status: "active",
      href: "/accommodation",
      badge: "ACTIVE SECTOR",
      badgeClass: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
      accent: "from-emerald-700 to-emerald-950",
      buttonText: "Enter Accommodation Sector",
      buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md",
      active: true,
    },
    {
      id: "contacts",
      title: "Contact Organizer & Messaging",
      tagline: "Active Operational Utility",
      description:
        "Privacy-first phone contacts cleaner, Nigerian number normalizer (+234), duplicate detector, 256 WhatsApp broadcast batcher & personalized template engine.",
      icon: Users,
      status: "active",
      href: "/contacts",
      badge: "ACTIVE UTILITY",
      badgeClass: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
      accent: "from-emerald-700 to-emerald-950",
      buttonText: "Launch Contact Organizer",
      buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md",
      active: true,
    },
    {
      id: "properties",
      title: "Properties Sector",
      tagline: "Phase 3 Development",
      description:
        "Strategic land acquisition, structured site development, disciplined property investments, and physical estate oversight.",
      icon: Building2,
      status: "upcoming",
      href: "#",
      badge: "NEXT PHASE",
      badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
      accent: "from-neutral-800 to-neutral-900",
      buttonText: "Development Pipeline",
      buttonClass: "bg-neutral-800 text-neutral-500 cursor-not-allowed",
      active: false,
    },
    {
      id: "rentals",
      title: "Rentals Sector",
      tagline: "Commercial Operations",
      description:
        "Commercial spaces, short-term rentals, event logistics, and heavy equipment leasing across university and municipal territories.",
      icon: KeyRound,
      status: "upcoming",
      href: "#",
      badge: "UPCOMING PHASE",
      badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
      accent: "from-neutral-800 to-neutral-900",
      buttonText: "Commercial Pipeline",
      buttonClass: "bg-neutral-800 text-neutral-500 cursor-not-allowed",
      active: false,
    },
    {
      id: "food",
      title: "Food & Catering Sector",
      tagline: "Nutritional Logistics",
      description:
        "Reliable student hostel food supply chains, daily meal plan deliveries, and institutional event catering.",
      icon: UtensilsCrossed,
      status: "upcoming",
      href: "#",
      badge: "UPCOMING PHASE",
      badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
      accent: "from-neutral-800 to-neutral-900",
      buttonText: "Logistics Pipeline",
      buttonClass: "bg-neutral-800 text-neutral-500 cursor-not-allowed",
      active: false,
    },
  ];

  const foundationPrinciples = [
    {
      number: "01",
      category: "Foundation Charter",
      title: "Identity Before Temptation",
      tagline: "Character Before Convenience",
      description:
        "When identity is established before opportunity arrives, shortcuts lose their power. Integrity precedes profit; character guarantees long-term sustainability.",
    },
    {
      number: "02",
      category: "Foundation Charter",
      title: "Systems Form Competence",
      tagline: "Order Over Impulse",
      description:
        "Talent without structure decays into confusion. Orderly processes, clear expectations, and daily tracking produce disciplined, repeatable excellence.",
    },
    {
      number: "03",
      category: "Foundation Charter",
      title: "Truth Is Not Negotiated",
      tagline: "Facts Over Comfort",
      description:
        "Facts are never distorted for numbers or ease. Full transparency in all field reports and negotiations creates unshakeable institutional trust.",
    },
    {
      number: "04",
      category: "Operational Standard",
      title: "Make It Easy for People to Trust You",
      tagline: "Calm, Reliable Authority",
      description:
        "When trust is established through prompt follow-through and calm composure, resistance disappears. Consistency dissolves suspicion.",
    },
    {
      number: "05",
      category: "Operational Standard",
      title: "The Client Is the King & Our Employer",
      tagline: "Sacred Duty of Service",
      description:
        "Clients are not mere transactions; they are served with familial care, genuine attention, and relentless protection of their interests.",
    },
    {
      number: "06",
      category: "Operational Standard",
      title: "Don't Hide Details. Be Truthful Always",
      tagline: "Absolute Ground Reality",
      description:
        "Never conceal shortcomings. State realities on utilities, pricing, and conditions plainly. Radical honesty builds permanent equity.",
    },
  ];

  const operationalSteps = [
    {
      step: "01",
      title: "Clear Daily Role Assignments",
      desc: "Every worker logs into their assigned workspace and immediately sees clear daily duty targets, zone quotas, and direct leadership directives.",
      icon: ClipboardList,
      highlight: "Role-Specific Dispatch",
    },
    {
      step: "02",
      title: "Structured Field & Client Documentation",
      desc: "Field agents record verified assets, lodge caretaker details, vacating student intel, and client requests in real time with zero guesswork.",
      icon: Target,
      highlight: "Rapid Field Capture",
    },
    {
      step: "03",
      title: "Cross-Sector Customer Care",
      desc: "Dedicated Customer Reps register incoming clients, verify field truthfulness, and capture feedback across every active KINGSOK sector.",
      icon: Headphones,
      highlight: "Cross-Sector Desk",
    },
    {
      step: "04",
      title: "Merit & Point-Based Rewards",
      desc: "Submissions undergo admin review with 1–5 star ratings. Earned performance points translate directly into financial rewards (1 Pt = ₦1,000).",
      icon: Award,
      highlight: "1 Pt = ₦1,000 Cash",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight block">
                KINGSOK
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block -mt-0.5">
                Apex Enterprise
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-emerald-700 transition-colors">
              About KINGSOK
            </a>
            <a href="#principles" className="hover:text-emerald-700 transition-colors">
              Core Principles
            </a>
            <a href="#operations" className="hover:text-emerald-700 transition-colors">
              How We Operate
            </a>
            <a href="#sectors" className="hover:text-emerald-700 transition-colors">
              Sectors
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login?portal=staff"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Staff Portal</span>
            </Link>
            <Link
              href="/login?portal=admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO & WHAT KINGSOK IS ALL ABOUT */}
      <section
        id="about"
        className="relative bg-gradient-to-b from-emerald-50/70 via-white to-slate-50/60 border-b border-slate-200 py-16 sm:py-24 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Operational & Workforce Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Not Primarily a Business. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">
              A Formation Ground.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Where latent potential is summoned, disorder is systematically replaced with disciplined execution, and people are forged to carry genuine organizational responsibility.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?portal=staff"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In as Staff</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?portal=admin"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300 shadow-xs transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Admin Portal</span>
            </Link>
          </div>

          {/* Key Quality Pillars Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
              <span className="text-emerald-700 font-extrabold text-xs block">100% Ground Truth</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Every lodge & contact physically vetted</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
              <span className="text-emerald-700 font-extrabold text-xs block">Zero Vanity Metrics</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Clean real-time data from 0 ground zero</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
              <span className="text-amber-600 font-extrabold text-xs block">₦1,000 / Pt Merit</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Automated points & cash earnings</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
              <span className="text-emerald-700 font-extrabold text-xs block">Multi-Sector Scalability</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Accommodation, Properties, Rentals, Food</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR CORE PRINCIPLES & FOUNDATION CHARTER */}
      <section
        id="principles"
        className="py-16 sm:py-20 px-4 max-w-6xl w-full mx-auto space-y-10 border-b border-slate-200"
      >
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Foundational Doctrine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            KINGSOK Core Principles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Unified tenets governing our business conduct, internal workforce development, and operational standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {foundationPrinciples.map((pr) => (
            <div
              key={pr.number}
              className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                    {pr.number}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {pr.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {pr.title}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    {pr.tagline}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {pr.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW WE OPERATE */}
      <section
        id="operations"
        className="py-16 sm:py-20 px-4 max-w-6xl w-full mx-auto space-y-10 border-b border-slate-200"
      >
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operating Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How We Operate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A structured, gamified workforce pipeline connecting ground-level reconnaissance with verified client fulfillment and financial merit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      STEP {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. THE KINGSOK SECTORS HUB */}
      <section id="sectors" className="py-16 sm:py-20 px-4 max-w-6xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Operational Portals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              KINGSOK Sectors Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Dedicated sector operational pipelines. The Accommodation sector is active now with real-time field workflows.
          </p>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isActive = sector.active;

            return (
              <div
                key={sector.id}
                className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "bg-white border-emerald-300 shadow-md hover:shadow-lg hover:border-emerald-500"
                    : "bg-slate-50/80 border-slate-200 opacity-75"
                }`}
              >
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-600 border border-slate-300"
                      } shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {sector.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {sector.title}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {sector.tagline}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sector.description}
                  </p>
                </div>

                <div className="p-4 sm:px-7 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  {isActive ? (
                    <Link
                      href={sector.href}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{sector.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-slate-200 text-slate-500 font-semibold text-xs rounded-xl cursor-not-allowed text-center"
                    >
                      {sector.buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-Sector Customer Rep Desk Banner */}
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/60 rounded-2xl border border-amber-300/80 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-800">
                <span>Unified Ecosystem Service</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Cross-Sector Customer Rep Desk
              </h4>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Customer Reps serve as the client advocacy bridge across all KINGSOK initiatives—registering prospective client details, collecting structured feedback, and safeguarding absolute truthfulness.
              </p>
            </div>
          </div>

          <Link
            href="/accommodation/customer-rep"
            className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Access Customer Rep Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-200">
            KINGSOK Apex Enterprise Ltd &bull; Workforce System v1.4
          </p>
          <p className="text-[11px] text-slate-400">
            Operating under the Foundation Charter: Character, Order, and Uncompromising Truth.
          </p>
        </div>
      </footer>
    </div>
  );
}
