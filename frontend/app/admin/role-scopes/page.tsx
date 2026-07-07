"use client";

import { useState, useEffect } from "react";
import { FlashBag } from "@/components/FlashBag";
import { useLanguage } from "@/contexts/language-context";
import { useRoleScopePoliciesQuery, useSaveRoleScopePoliciesMutation } from "@/lib/hooks/queries";
import { ROLE_GROUPS, DOCUMENT_SCOPES, getRoleLabel, type RoleLang } from "@/lib/api";

const SCOPE_LABELS: Record<RoleLang, Record<string, string>> = {
  fr: { rh: "RH", tech: "Tech", finance: "Finance", design: "Design", legal: "Juridique" },
  en: { rh: "HR", tech: "Tech", finance: "Finance", design: "Design", legal: "Legal" },
};

type PolicyMap = Record<string, Set<string>>;

function buildPolicyMap(entries: Array<{ role: string; documentScopes: string[] }>): PolicyMap {
  const map: PolicyMap = {};
  for (const entry of entries) {
    map[entry.role] = new Set(entry.documentScopes);
  }
  return map;
}

export default function RoleScopesPage() {
  const { t, lang } = useLanguage();
  const tr = t.roleScopes;
  const [policies, setPolicies] = useState<PolicyMap>({});
  const [saveOk, setSaveOk] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data = [], isLoading, isError, error } = useRoleScopePoliciesQuery();
  const saveMutation = useSaveRoleScopePoliciesMutation();

  // Initialize editable policies from fetched data (effect is intentional here)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (data.length > 0 && Object.keys(policies).length === 0) {
      setPolicies(buildPolicyMap(data));
    }
  }, [data, policies]);


  const allRoles = ROLE_GROUPS[lang].flatMap((g) => g.roles);
  const scopes = DOCUMENT_SCOPES;
  const scopeLabels = SCOPE_LABELS[lang];
  const loadError = isError ? ((error as { message?: string })?.message ?? tr.loadError) : null;

  function toggle(role: string, scope: string) {
    setPolicies((prev) => {
      const next = { ...prev };
      const set = new Set(next[role] ?? []);
      if (set.has(scope)) {
        set.delete(scope);
      } else {
        set.add(scope);
      }
      next[role] = set;
      return next;
    });
    setSaveOk(false);
  }

  async function handleSave() {
    setServerError(null);
    setSaveOk(false);
    const body = allRoles.map((r) => ({
      role: r.value,
      documentScopes: Array.from(policies[r.value] ?? []),
    }));
    try {
      await saveMutation.mutateAsync(body);
      setSaveOk(true);
    } catch (err: unknown) {
      setServerError((err as { message?: string })?.message ?? tr.loadError);
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy dark:text-white">{tr.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{tr.subtitle}</p>
      </div>

      {loadError && <FlashBag variant="error" message={loadError} />}
      {serverError && <FlashBag variant="error" message={serverError} />}
      {saveOk && <FlashBag variant="success" message={tr.saveOk} />}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-50 dark:bg-zinc-800/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide w-56">
                  {lang === "fr" ? "Rôle" : "Role"}
                </th>
                {scopes.map((scope) => (
                  <th
                    key={scope}
                    className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide"
                  >
                    {scopeLabels[scope] ?? scope}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-700/60">
              {ROLE_GROUPS[lang].map((group) => (
                <>
                  <tr key={`group-${group.label}`} className="bg-slate-50/70 dark:bg-zinc-800/40">
                    <td
                      colSpan={scopes.length + 1}
                      className="px-6 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.roles.map((r) => (
                    <tr key={r.value} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                            {getRoleLabel(r.value, lang)}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                            {r.value}
                          </span>
                        </div>
                      </td>
                      {scopes.map((scope) => (
                        <td key={scope} className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={policies[r.value]?.has(scope) ?? false}
                            onChange={() => toggle(r.value, scope)}
                            className="h-4 w-4 rounded border-slate-300 dark:border-zinc-600 text-brand-purple focus:ring-brand-purple cursor-pointer"
                            aria-label={`${getRoleLabel(r.value, lang)} — ${scopeLabels[scope]}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || isLoading}
          className="rounded-lg bg-brand-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-60 transition-colors"
        >
          {saveMutation.isPending ? tr.saving : tr.save}
        </button>
        {saveOk && (
          <span className="text-sm text-green-600 dark:text-green-400">{tr.saveOk}</span>
        )}
      </div>
    </div>
  );
}
