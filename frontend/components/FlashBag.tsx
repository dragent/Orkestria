"use client";

import { useState } from "react";

type FlashBagVariant = "success" | "error";

type FlashBagProps = {
  variant: FlashBagVariant;
  message: string;
};

const variantStyles: Record<FlashBagVariant, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  error: "bg-red-50 border-red-200 text-red-700",
};

export function FlashBag({ variant, message }: FlashBagProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 opacity-60 hover:opacity-100 transition leading-none"
      >
        ✕
      </button>
    </div>
  );
}
