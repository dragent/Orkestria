import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "End-to-end project management",
    description: "From lead to invoice — track every step of your project pipeline in one place.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Multi-actor collaboration",
    description: "Bring together your internal teams, subcontractors and clients with scoped access.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Role-based access control",
    description: "Every user sees only what they need. Scoped by domain: HR, Finance, Tech, Legal, Design.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Financial tracking",
    description: "Generate quotes, issue invoices and monitor margins — all linked to your projects.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "Smart document management",
    description: "Upload, classify and retrieve documents automatically with AI-powered categorisation.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-time performance insights",
    description: "Monitor your teams, track time and analyse profitability with live dashboards.",
  },
];

const visions = [
  {
    role: "Company",
    emoji: "🏢",
    color: "from-brand-navy to-brand-navy-light",
    badge: "bg-brand-navy/10 text-brand-navy",
    items: [
      "Manage clients, projects & employees",
      "Assign subcontractors",
      "Monitor costs and margins",
      "Global dashboard",
    ],
  },
  {
    role: "Subcontractor",
    emoji: "🔧",
    color: "from-brand-purple to-brand-purple-light",
    badge: "bg-brand-purple/10 text-brand-purple",
    items: [
      "Access assigned projects",
      "Scoped to your domain",
      "Upload deliverables",
      "Track your tasks",
    ],
  },
  {
    role: "Client",
    emoji: "👤",
    color: "from-brand-blue to-brand-blue-light",
    badge: "bg-brand-blue/10 text-brand-blue",
    items: [
      "Project timeline & status",
      "Validate quotes",
      "Access shared documents",
      "Download invoices",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/img/logo.png"
            alt="Orkestria"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-navy transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-brand-purple hover:bg-brand-navy transition"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full bg-brand-purple opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-brand-blue opacity-15 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-purple opacity-10 blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            Multi-tenant SaaS — now in development
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            Orchestrate your{" "}
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-blue to-brand-blue-light bg-clip-text text-transparent">
              projects & teams
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Centralize collaboration between your company, subcontractors and clients.
            From quote to invoice — everything in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 text-base font-semibold text-white rounded-xl bg-brand-purple hover:bg-brand-purple-light transition shadow-lg shadow-brand-purple/30"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-base font-semibold text-white rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Purpose-built for project-driven companies working with external teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-purple/30 hover:shadow-md transition group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-brand-navy mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 visions */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              One platform, three perspectives
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Each actor gets a tailored experience designed for their role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visions.map((vision) => (
              <div key={vision.role} className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <div className={`bg-gradient-to-br ${vision.color} p-8`}>
                  <span className="text-4xl">{vision.emoji}</span>
                  <h3 className="mt-4 text-xl font-bold text-white">{vision.role}</h3>
                </div>
                <div className="bg-white p-6 space-y-3">
                  {vision.items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-purple opacity-15 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-blue opacity-10 blur-[80px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to take control?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Create your account in seconds and start managing your first project today.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 text-base font-semibold text-white rounded-xl bg-brand-purple hover:bg-brand-purple-light transition shadow-lg shadow-brand-purple/40"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/img/logo.png"
            alt="Orkestria"
            width={120}
            height={30}
            className="h-7 w-auto brightness-0 invert opacity-60"
          />
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Orkestria. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/login" className="hover:text-white transition">Sign in</Link>
            <Link href="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
