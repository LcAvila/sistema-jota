"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Order, groupOrdersByStatus, listOrders } from "@/lib/api";
import { useSession } from "@/store/session";

export function useOrders(pollMs: number = 5000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session?.token) throw new Error("Não autenticado");
      const data = await listOrders(session.token);
      setOrders(data);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar pedidos");
    } finally { setLoading(false); }
  }, [session?.token]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, pollMs);
    return () => clearInterval(id);
  }, [fetchOrders, pollMs]);

  const groups = useMemo(() => groupOrdersByStatus(orders), [orders]);
  const counters = useMemo(() => ({
    total: orders.length,
    pending: groups.pending.length,
    preparing: groups.preparing.length,
    ready: groups.ready.length,
    delivered: groups.delivered.length,
  }), [orders.length, groups]);

  return { orders, setOrders, groups, counters, loading, error, refresh: fetchOrders };
}
