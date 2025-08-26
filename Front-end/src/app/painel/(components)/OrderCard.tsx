"use client";
import { Order, OrderStatus, changeOrderStatus } from "@/lib/api";
import StatusBadge from "./StatusBadge";
import { useSession } from "@/store/session";
import { useState } from "react";
import { useToast } from "@/store/toast";
import { canAdvance } from "@/lib/permissions";

const NEXT_BY_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
};

export default function OrderCard({ order, onUpdated }: { order: Order; onUpdated: (o: Order)=>void }) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const { success, error: showError, show } = useToast();
  const next = NEXT_BY_STATUS[order.status];


  const handleAdvance = async () => {
    if (!session || !next) return;
    if (!canAdvance(session.role, order.status, next)) {
      showError("Você não tem permissão para mudar para este status.");
      return;
    }
    setLoading(true);
    try {
      const prev = order.status;
      const updated = await changeOrderStatus(order.id, next, session.token);
      onUpdated(updated);
      success(`Pedido #${order.id} agora está "${NEXT_LABEL[next]}"`, "Status atualizado");
      // Ação de desfazer
      show({
        kind: "info",
        title: "Mudança aplicada",
        message: `Clique para desfazer a mudança de status`,
        action: {
          label: "Desfazer",
          onClick: async () => {
            try {
              const reverted = await changeOrderStatus(order.id, prev, session.token);
              onUpdated(reverted);
              success(`Pedido #${order.id} voltou para "${NEXT_LABEL[prev]}"`, "Ação desfeita");
            } catch (e: any) {
              showError(e?.message || "Não foi possível desfazer");
            }
          }
        }
      });
    } catch (e: any) {
      showError(e?.message || "Erro ao mudar status", "Falha ao atualizar");
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-smooth">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">Pedido #{order.id} • {order.clientName}</div>
          <div className="text-sm opacity-70">Vendedor: {order.sellerName} • Loja: {order.storeName}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-3 text-sm">
        {order.items.map(it => (
          <div key={it.id} className="flex justify-between opacity-90">
            <span>{it.qty}x {it.name}</span>
            <span>R$ {(it.unitPrice * it.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold">Total: R$ {order.total.toFixed(2)}</span>
        <div className="flex gap-2">
          {next && (
            <button onClick={handleAdvance} disabled={loading || !canAdvance(session?.role, order.status, next)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60">
              Avançar para {NEXT_LABEL[next]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const NEXT_LABEL: Record<OrderStatus, string> = {
  pending: "Preparando",
  preparing: "Pronto",
  ready: "Entregue",
  delivered: "-",
};
