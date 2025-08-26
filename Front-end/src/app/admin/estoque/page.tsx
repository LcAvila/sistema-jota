"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";

type ProdutoEstoque = {
  id: number; sku: string; code?: string; name: string; stock: number; minStock?: number | null; unit?: string | null; barcode?: string | null; belowMin?: boolean;
};

export default function EstoqueOverviewPage() {
  const { info, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ProdutoEstoque[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const resp = await apiFetch('/stock/overview');
      const data = await resp.json();
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      error(e?.message || 'Falha ao carregar estoque');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(t) ||
      r.sku.toLowerCase().includes(t) ||
      (r.code || '').toLowerCase().includes(t) ||
      (r.barcode || '').toLowerCase().includes(t)
    );
  }, [rows, q]);

  const low = useMemo(() => filtered.filter(r => r.belowMin), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Estoque' }]} />
          <h1 className="text-2xl md:text-3xl font-black">Controle de Estoque</h1>
          <p className="text-sm text-slate-500">Visão geral de saldos, mínimo e alertas</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/estoque/movimentacoes" className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Movimentações</Link>
          <Link href="/admin/estoque/ajuste" className="px-3 py-2 rounded bg-[var(--brand)] text-white text-sm">Ajuste Manual</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nome, código, SKU ou código de barras" className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm min-w-[240px]" />
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">{loading ? 'Carregando...' : 'Recarregar'}</button>
        <span className="text-xs text-slate-500">Itens: {filtered.length} • Abaixo do mínimo: {low.length}</span>
      </div>

      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-right p-3">Estoque</th>
              <th className="text-right p-3">Mínimo</th>
              <th className="text-left p-3">Unid.</th>
              <th className="text-left p-3">Código de barras</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <td className="p-3 font-mono text-xs">{p.sku}</td>
                <td className="p-3 font-mono text-xs">{p.code || '-'}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-right font-semibold">{p.stock}</td>
                <td className="p-3 text-right">{p.minStock ?? '-'}</td>
                <td className="p-3">{p.unit || '-'}</td>
                <td className="p-3">{p.barcode || '-'}</td>
                <td className="p-3">
                  {p.belowMin ? <span className="text-red-600">Abaixo do mínimo</span> : <span className="text-emerald-600">OK</span>}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/estoque/ajuste?productId=${p.id}`} className="text-[var(--brand)] hover:underline">Ajustar</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-slate-500">Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
