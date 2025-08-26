"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";
import { useSearchParams } from "next/navigation";

type Produto = { id: number; sku: string; name: string; stock: number; unit?: string | null };

enum Kind { In = 'in', Out = 'out' }

enum RefType { Order = 'order', Manual = 'manual', Adjustment = 'adjustment' }

export default function AjusteEstoquePage() {
  const { success, error } = useToast();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState<string>(params.get('productId') || "");
  const [product, setProduct] = useState<Produto | null>(null);
  const [qty, setQty] = useState<number>(0);
  const [kind, setKind] = useState<Kind>(Kind.In);
  const [referenceType, setReferenceType] = useState<RefType>(RefType.Manual);
  const [referenceId, setReferenceId] = useState<string>("");

  const loadProduct = async () => {
    if (!productId) { setProduct(null); return; }
    setLoading(true);
    try {
      // reutiliza overview para obter estoque atual e metadados
      const resp = await apiFetch('/stock/overview');
      const data = await resp.json();
      const list: any[] = Array.isArray(data?.data) ? data.data : [];
      const found = list.find(p => String(p.id) === String(productId));
      setProduct(found ? { id: found.id, sku: found.sku, name: found.name, stock: found.stock, unit: found.unit } : null);
      if (!found) error('Produto não encontrado na visão de estoque');
    } catch (e: any) {
      error(e?.message || 'Falha ao buscar produto');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProduct(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [productId]);

  const submit = async () => {
    if (!productId || qty <= 0) { error('Informe produto e quantidade > 0'); return; }
    setSaving(true);
    try {
      const resp = await apiFetch('/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(productId), qty: Number(qty), kind, referenceType, referenceId: referenceId ? Number(referenceId) : undefined }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Erro ao salvar');
      success('Movimentação registrada com sucesso');
      // refresh product after save
      await loadProduct();
      setQty(0);
    } catch (e: any) {
      error(e?.message || 'Falha ao registrar movimentação');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Estoque', href: '/admin/estoque' }, { label: 'Ajuste Manual' }]} />
          <h1 className="text-2xl md:text-3xl font-black">Ajuste Manual</h1>
          <p className="text-sm text-slate-500">Registre entradas e saídas manuais</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/estoque" className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Visão geral</Link>
          <Link href="/admin/estoque/movimentacoes" className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Movimentações</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2">
            <label className="w-32 text-sm text-slate-600">Produto ID</label>
            <input value={productId} onChange={e=>setProductId(e.target.value)} placeholder="ID do produto" className="flex-1 px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm" />
            <button onClick={loadProduct} disabled={loading} className="px-3 py-2 rounded border border-[var(--border)] text-sm">{loading ? 'Buscando...' : 'Buscar'}</button>
          </div>
          {product && (
            <div className="text-sm text-slate-700 bg-[var(--muted)] rounded p-3">
              <div><span className="text-slate-500">SKU:</span> <span className="font-mono">{product.sku}</span></div>
              <div><span className="text-slate-500">Produto:</span> {product.name}</div>
              <div><span className="text-slate-500">Estoque atual:</span> <b>{product.stock} {product.unit || ''}</b></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="w-32 text-sm text-slate-600">Tipo</label>
            <select value={kind} onChange={e=>setKind(e.target.value as Kind)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm">
              <option value={Kind.In}>Entrada</option>
              <option value={Kind.Out}>Saída</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-sm text-slate-600">Quantidade</label>
            <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm w-40" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-sm text-slate-600">Origem</label>
            <select value={referenceType} onChange={e=>setReferenceType(e.target.value as RefType)} className="px-2 py-2 rounded border border-[var(--border)] bg-transparent text-sm">
              <option value={RefType.Manual}>Manual</option>
              <option value={RefType.Adjustment}>Ajuste</option>
              <option value={RefType.Order}>Pedido</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-sm text-slate-600">Ref. ID</label>
            <input value={referenceId} onChange={e=>setReferenceId(e.target.value)} placeholder="Opcional" className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm w-40" />
          </div>
          <div>
            <button onClick={submit} disabled={saving} className="px-4 py-2 rounded bg-[var(--brand)] text-white text-sm">{saving ? 'Salvando...' : 'Registrar'}</button>
          </div>
        </div>

        <div className="space-y-2 border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold">Últimas movimentações</h3>
          <UltimasMovimentacoes productId={productId} />
        </div>
      </div>
    </div>
  );
}

function UltimasMovimentacoes({ productId }: { productId: string }) {
  const { error } = useToast();
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    if (!productId) { setRows([]); return; }
    try {
      const resp = await apiFetch(`/stock/movements?productId=${productId}&limit=10`);
      const data = await resp.json();
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      error(e?.message || 'Falha ao carregar últimas movimentações');
    }
  };

  useEffect(() => { load(); }, [productId]);

  if (!productId) return <div className="text-sm text-slate-500">Informe um produto para ver o histórico.</div>;
  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)]">
          <tr>
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Tipo</th>
            <th className="text-right p-2">Qtd</th>
            <th className="text-left p-2">Origem</th>
            <th className="text-left p-2">Ref</th>
            <th className="text-left p-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="border-t border-[var(--border)]">
              <td className="p-2">{m.id}</td>
              <td className="p-2">{m.type === 'in' ? 'Entrada' : 'Saída'}</td>
              <td className="p-2 text-right">{m.qty}</td>
              <td className="p-2">{m.referenceType || '-'}</td>
              <td className="p-2">{m.referenceId || '-'}</td>
              <td className="p-2">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="p-3 text-center text-slate-500">Sem registros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
