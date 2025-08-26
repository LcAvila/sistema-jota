"use client";
import { useEffect, useState } from "react";
import { Notification, listNotifications, markNotificationRead } from "@/lib/api";

export default function NotificacoesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotifications();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await markNotificationRead(id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Notificações</h1>
        <button onClick={load} className="px-3 py-1.5 rounded border hover:bg-slate-100">Atualizar</button>
      </div>
      {loading && <div className="text-slate-500">Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-3">
        {items.map(n => (
          <div key={n.id} className={`rounded border p-3 ${n.read ? 'bg-white' : 'bg-emerald-50'}`}>
            <div className="flex items-center justify-between">
              <div className="font-bold">{n.title}</div>
              <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-slate-700 text-sm mt-1">{n.message}</p>
            {!n.read && (
              <button onClick={() => markRead(n.id)} className="mt-2 text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Marcar como lida</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
