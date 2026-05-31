"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import TicketDetail from "@/components/tickets/TicketDetail";

export default function DevTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  const id = Number(params?.id);

  if (!Number.isFinite(id)) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <p className="text-sm text-red-600">{t.tickets.loadError}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-4xl mx-auto space-y-4">
      <Link href="/dev/tickets" className="text-sm text-brand-purple hover:underline">
        ← {t.tickets.backToList}
      </Link>
      <TicketDetail ticketId={id} canEdit canDelete={false} />
    </div>
  );
}
