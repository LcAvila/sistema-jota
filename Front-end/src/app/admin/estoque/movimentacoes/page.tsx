"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";

type Movement = {
  id: number;
  productId: number;
  qty: number;
  type: string; // 'in' | 'out'
  referenceType?: 'order' | 'manual' | 'adjustment' | null;
  referenceId?: number | null;
  createdAt: string;
  product?: { id: number; sku: string; name: string; unit?: string | null };
};

export default function MovimentacoesPage() {
  const { error } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Movement[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [referenceType, setReferenceType] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (productId) params.set('productId', productId);
      if (type) params.set('type', type);
      if (referenceType) params.set('referenceType', referenceType);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', '200');
      const resp = await apiFetch(`/stock/movements?${params.toString()}`, { cache: 'no-store' });
      const data = await resp.json();
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      error(e?.message || 'Falha ao carregar movimentações');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalIn = useMemo(() => rows.filter(r => r.type === 'in').reduce((s, r) => s + r.qty, 0), [rows]);
  const totalOut = useMemo(() => rows.filter(r => r.type === 'out').reduce((s, r) => s + r.qty, 0), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Estoque', href: '/admin/estoque' }, { label: 'Movimentações' }]} />
          <h1 className="text-2xl md:text-3xl font-black">Movimentações de Estoque</h1>
          <p className="text-sm text-slate-500">Entradas e saídas com filtros</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/estoque" className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Visão geral</Link>
          <Link href="/admin/estoque/ajuste" className="px-3 py-2 rounded bg-[var(--brand)] text-white text-sm">Ajuste Manual</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={productId} onChange={e=>setProductId(e.target.value)} placeholder="ID do produto" className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm w-[140px]" />
        <select value={type} onChange={e=>setType(e.target.value)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm">
          <option value="">Tipo</option>
          <option value="in">Entrada</option>
          <option value="out">Saída</option>
        </select>
        <select value={referenceType} onChange={e=>setReferenceType(e.target.value)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm">
          <option value="">Origem</option>
          <option value="order">Pedido</option>
          <option value="manual">Manual</option>
          <option value="adjustment">Ajuste</option>
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm" />
        <span className="text-xs text-slate-500">até</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm" />
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">{loading ? 'Carregando...' : 'Filtrar'}</button>
        <span className="text-xs text-slate-500">Entradas: {totalIn} • Saídas: {totalOut}</span>
      </div>

      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-right p-3">Qtd</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Origem</th>
              <th className="text-left p-3">Ref</th>
              <th className="text-left p-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id} className="border-t border-[var(--border)]">
                <td className="p-3">{m.id}</td>
                <td className="p-3">{m.product ? `${m.product.sku} — ${m.product.name}` : m.productId}</td>
                <td className="p-3 text-right font-semibold">{m.qty}</td>
                <td className="p-3">{m.type === 'in' ? 'Entrada' : 'Saída'}</td>
                <td className="p-3">{m.referenceType || '-'}</td>
                <td className="p-3">{m.referenceId || '-'}</td>
                <td className="p-3">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Nenhuma movimentação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
