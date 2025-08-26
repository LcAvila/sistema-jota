"use client";
import { OrderStatus } from "@/lib/api";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Pendente" },
    preparing: { bg: "bg-blue-100", text: "text-blue-800", label: "Preparando" },
    ready: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Pronto" },
    delivered: { bg: "bg-slate-100", text: "text-slate-800", label: "Entregue" },
  };
  const s = map[status];
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded ${s.bg} ${s.text}`}>{s.label}</span>;
}
