"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <img src="/img/logo.png" alt="Orkestria" className="h-8 w-auto" />
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-brand-navy transition font-medium"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-slate-500">
            Authentication is working. The full dashboard is coming in the next phase.
          </p>
        </div>
      </main>
    </div>
  );
}
