"use client";
import { useOrders } from "@/lib/useOrders";
import OrderCard from "../(components)/OrderCard";

export default function EntregasPage() {
  const { groups, loading, error, setOrders, refresh } = useOrders(5000);
  const onUpdated = (o: any) => setOrders(prev => prev.map(p => p.id === o.id ? o : p));
  const list = [...groups.ready, ...groups.delivered];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Entregas</h1>
        <button onClick={refresh} className="px-3 py-1.5 rounded border hover:bg-slate-100">Atualizar</button>
      </div>
      {loading && <div className="text-slate-500">Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {list.length === 0 && <div className="text-sm text-slate-500">Sem pedidos para entrega</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(o => (
          <OrderCard key={o.id} order={o} onUpdated={onUpdated} />
        ))}
      </div>
    </div>
  );
}
