"use client";
import { useMemo, useState, useCallback } from "react";
import { Order, OrderStatus, changeOrderStatus } from "@/lib/api";
import OrderCard from "../(components)/OrderCard";
import { useOrders } from "@/lib/useOrders";
import { useSession } from "@/store/session";
import { useToast } from "@/store/toast";
import { canMove } from "@/lib/permissions";

export default function PedidosPage() {
  const { orders, setOrders, groups, counters, loading, error, refresh } = useOrders(5000);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | keyof typeof groups>("all");
  const { session } = useSession();
  const { success, error: showError } = useToast();


  const onUpdated = (updated: Order) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const filteredGroups = useMemo(() => {
    const match = (o: Order) => {
      const q = query.trim().toLowerCase();
      const okText = q === "" || o.clientName.toLowerCase().includes(q) || String(o.id).includes(q);
      return okText;
    };
    const source = statusFilter === "all" ? orders.filter(match) : groups[statusFilter].filter(match);
    return {
      pending: source.filter(o => o.status === "pending"),
      preparing: source.filter(o => o.status === "preparing"),
      ready: source.filter(o => o.status === "ready"),
      delivered: source.filter(o => o.status === "delivered"),
    };
  }, [orders, groups, query, statusFilter]);

  const onDropTo = useCallback(async (target: OrderStatus, data: { id: number; from: OrderStatus }) => {
    if (!session) return;
    if (data.from === target) return; // no-op
    if (!canMove(session.role, data.from, target)) {
      showError("Você não tem permissão para mover para este status");
      return;
    }
    try {
      const updated = await changeOrderStatus(data.id, target, session.role);
      onUpdated(updated);
      success(`Pedido #${updated.id} movido para ${target}`);
    } catch (e: any) {
      showError(e?.message || "Não foi possível mover o pedido");
    }
  }, [session, success, showError]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-black">Pedidos</h1>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por cliente ou #id" className="border rounded px-3 py-1.5 w-56"/>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="border border-[var(--border)] rounded px-3 py-1.5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="preparing">Preparando</option>
            <option value="ready">Pronto</option>
            <option value="delivered">Entregue</option>
          </select>
          <button onClick={refresh} className="px-3 py-1.5 rounded border hover:bg-slate-100">Atualizar</button>
        </div>
      </div>
      <div className="flex gap-3 text-sm">
        <Badge label="Total" value={counters.total} color="bg-slate-100" />
        <Badge label="Pendente" value={counters.pending} color="bg-amber-100" />
        <Badge label="Preparando" value={counters.preparing} color="bg-blue-100" />
        <Badge label="Pronto" value={counters.ready} color="bg-emerald-100" />
        <Badge label="Entregue" value={counters.delivered} color="bg-slate-100" />
      </div>
      {loading && <div className="text-slate-500">Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Column title="Pendente" status="pending" orders={filteredGroups.pending} onUpdated={onUpdated} onDropTo={onDropTo} />
        <Column title="Preparando" status="preparing" orders={filteredGroups.preparing} onUpdated={onUpdated} onDropTo={onDropTo} />
        <Column title="Pronto" status="ready" orders={filteredGroups.ready} onUpdated={onUpdated} onDropTo={onDropTo} />
        <Column title="Entregue" status="delivered" orders={filteredGroups.delivered} onUpdated={onUpdated} onDropTo={onDropTo} />
      </div>
    </div>
  );
}

function Column({ title, status, orders, onUpdated, onDropTo }: { title: string; status: OrderStatus; orders: Order[]; onUpdated: (o: Order)=>void; onDropTo: (status: OrderStatus, data: { id: number; from: OrderStatus })=>void }) {
  const [over, setOver] = useState(false);
  const { session } = useSession();
  return (
    <div
      className={`space-y-3 rounded-lg p-2 ${over ? 'bg-[var(--muted)]' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragEnter={() => setOver(true)}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault();
        setOver(false);
        try {
          const json = e.dataTransfer.getData('application/json');
          if (!json) return;
          const data = JSON.parse(json) as { id: number; from: OrderStatus };
          onDropTo(status, data);
        } catch { /* noop */ }
      }}
    >
      <h2 className="font-bold opacity-70">{title}</h2>
      {orders.length === 0 && <div className="text-sm opacity-60">Sem pedidos</div>}
      {orders.map(o => (
        <div
          key={o.id}
          draggable={!!session}
          onDragStart={e => {
            e.dataTransfer.setData('application/json', JSON.stringify({ id: o.id, from: o.status }));
            e.dataTransfer.effectAllowed = 'move';
          }}
        >
          <OrderCard order={o} onUpdated={onUpdated} />
        </div>
      ))}
    </div>
  );
}

function Badge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`px-3 py-1 rounded ${color} text-slate-800`}>{label}: <span className="font-bold">{value}</span></div>
  );
}
