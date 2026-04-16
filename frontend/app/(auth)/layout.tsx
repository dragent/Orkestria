export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand identity */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-brand-navy relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-brand-purple opacity-20 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-brand-blue opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10">
          <img
            src="/img/logo.png"
            alt="Orkestria"
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Orchestrate your projects,{" "}
            <span className="bg-gradient-to-r from-brand-purple-light to-brand-blue bg-clip-text text-transparent">
              effortlessly.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage clients, teams, subcontractors and financials — all in one platform.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          <span className="text-slate-500 text-sm">
            Secure • Multi-tenant • Role-based
          </span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
