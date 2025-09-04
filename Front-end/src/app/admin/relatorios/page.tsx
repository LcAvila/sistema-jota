"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/store/toast";

// Tipo atualizado para incluir todos os campos da tela de importar vendas
type Venda = { 
  id: number; 
  cliente: string; 
  telefone?: string;
  cep?: string;
  endereco?: string;
  itens: string[]; 
  total: number; 
  vendedor: string; 
  forma: string; 
  canal?: string;
  data: string; 
  createdAt: string; 
};

type GroupRow = { key: string; total: number; pedidos: number };

type Filters = { 
  from: string; 
  to: string; 
  seller: string; 
  forma: string; 
  canal: string;
};

export default function RelatoriosPage() {
  const { info, error: showError } = useToast();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    from: "", 
    to: "", 
    seller: "", 
    forma: "", 
    canal: "" 
  });

  // Carrega vendas do backend, com fallback ao localStorage
  const reload = useCallback(async () => {
    const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const baseUrl = rawBase.replace(/\/?api\/?$/, "");
    try {
      const resp = await fetch(`${baseUrl}/api/public/recent-orders?limit=1000`, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      const mapped: Venda[] = rows.map((r: any, idx: number) => {
        const createdAt = r.createdAt || new Date().toISOString();
        const dt = new Date(createdAt);
        const hh = String(dt.getHours()).padStart(2, '0');
        const mm = String(dt.getMinutes()).padStart(2, '0');
        return {
          id: Number(r.id ?? idx + 1),
          cliente: r.cliente ?? '',
          telefone: r.telefone || null,
          cep: r.cep || null,
          endereco: r.endereco || null,
          itens: Array.isArray(r.itens) ? r.itens : [],
          total: Number(r.total ?? 0),
          vendedor: r.vendedor ?? '',
          forma: r.forma ?? '',
          canal: r.canal || 'Local',
          data: r.data || `${hh}:${mm}`,
          createdAt,
        } as Venda;
      });
      setVendas(mapped);
      info("Dados carregados do servidor");
    } catch (e) {
      try {
        const raw = localStorage.getItem("admin_vendas");
        const arr: Venda[] = raw ? JSON.parse(raw) : [];
        setVendas(Array.isArray(arr) ? arr : []);
        info("Dados carregados do dispositivo");
      } catch {
        showError("Falha ao carregar vendas");
      }
    }
  }, [info, showError]);

  useEffect(() => { reload(); }, [reload]);

  const set = (patch: Partial<Filters>) => setFilters(prev => ({ ...prev, ...patch }));

  // Distincts
  const vendedores = useMemo(() => Array.from(new Set(vendas.map(v => v.vendedor).filter(Boolean))), [vendas]);
  const formas = useMemo(() => Array.from(new Set(vendas.map(v => v.forma).filter(Boolean))), [vendas]);
  const canais = useMemo(() => Array.from(new Set(vendas.map(v => v.canal).filter(Boolean))), [vendas]);

  // Filtrados
  const filtered = useMemo(() => {
    return vendas.filter(v => {
      const d = (v.createdAt || "").slice(0,10);
      if (filters.from && d < filters.from) return false;
      if (filters.to && d > filters.to) return false;
      if (filters.seller && v.vendedor !== filters.seller) return false;
      if (filters.forma && v.forma !== filters.forma) return false;
      if (filters.canal && v.canal !== filters.canal) return false;
      return true;
    });
  }, [vendas, filters]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filtered.reduce((s, v) => s + (v.total || 0), 0);
    const pedidos = filtered.length;
    const ticket = pedidos ? total / pedidos : 0;
    // por dia
    const byDay = new Map<string, number>();
    filtered.forEach(v => {
      const d = (v.createdAt || "").slice(0,10);
      if (!d) return;
      byDay.set(d, (byDay.get(d) || 0) + v.total);
    });
    const mediaDia = byDay.size ? Array.from(byDay.values()).reduce((a,b)=>a+b,0) / byDay.size : 0;
    return { total, pedidos, ticket, mediaDia };
  }, [filtered]);

  // Agrupamentos com tipagem corrigida
  const groupBy = (key: (v: Venda) => string): GroupRow[] => {
    return filtered.reduce<GroupRow[]>((acc: GroupRow[], v: Venda) => {
      const k = key(v) || "(Não informado)";
      const existente = acc.find((r: GroupRow) => r.key === k);
      if (existente) {
        existente.total += v.total || 0;
        existente.pedidos += 1;
      } else {
        acc.push({ key: k, total: v.total || 0, pedidos: 1 });
      }
      return acc;
    }, []).sort((a: GroupRow, b: GroupRow) => b.total - a.total);
  };

  const porVendedor = useMemo(() => groupBy(v => v.vendedor), [filtered]);
  const porForma = useMemo(() => groupBy(v => v.forma), [filtered]);
  const porCanal = useMemo(() => groupBy(v => v.canal), [filtered]);
  const porDia = useMemo(() => groupBy(v => (v.createdAt||"").slice(0,10)), [filtered]);

  // Percentuais e dimensionamento de barras
  const maxVendedor = Math.max(1, ...porVendedor.map(r => r.total));
  const maxForma = Math.max(1, ...porForma.map(r => r.total));
  const maxCanal = Math.max(1, ...porCanal.map(r => r.total));
  const maxDia = Math.max(1, ...porDia.map(r => r.total));

  // Exportações
  const exportCSV = useCallback(() => {
    const headers = ["id","cliente","telefone","cep","endereco","itens","vendedor","forma","canal","total","data","createdAt"];
    const rows = filtered.map(v => [
      v.id,
      v.cliente,
      v.telefone || '',
      v.cep || '',
      v.endereco || '',
      '"' + v.itens.join('; ') + '"',
      v.vendedor,
      v.forma,
      v.canal || 'Local',
      v.total.toFixed(2).replace('.', ','),
      v.data,
      v.createdAt,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = `${filters.from || ''}_a_${filters.to || ''}${filters.seller ? `_vend_${filters.seller}` : ''}${filters.forma ? `_forma_${filters.forma}` : ''}${filters.canal ? `_canal_${filters.canal}` : ''}`;
    a.download = `relatorio_vendas_${suffix || 'todos'}.csv`;
    document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
  }, [filtered, filters]);

  const exportXLSX = useCallback(async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    // Sheet Vendas (filtradas)
    const vendasHeader = ['ID','Cliente','Telefone','CEP','Endereço','Itens','Vendedor','Forma','Canal','Total','Data','CriadoEm'];
    const vendasRows = filtered.map(v => [
      `#${v.id}`,
      v.cliente,
      v.telefone || '',
      v.cep || '',
      v.endereco || '',
      v.itens.join(', '),
      v.vendedor,
      v.forma,
      v.canal || 'Local',
      Number(v.total.toFixed(2)),
      v.data,
      v.createdAt,
    ]);
    const wsVendas = XLSX.utils.aoa_to_sheet([
      ['Período', filters.from || '-', 'a', filters.to || '-', 'Vendedor', filters.seller || 'Todos', 'Forma', filters.forma || 'Todas', 'Canal', filters.canal || 'Todos'],
      [],
      vendasHeader,
      ...vendasRows,
    ]);
    // @ts-ignore
    (wsVendas as any)['!freeze'] = { rows: 3 };
    XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas');

    // Sheet Por Vendedor
    const wsVend = XLSX.utils.json_to_sheet(porVendedor.map(r => ({ Vendedor: r.key, Pedidos: r.pedidos, Total: Number(r.total.toFixed(2)) })));
    // @ts-ignore
    (wsVend as any)['!freeze'] = { rows: 1 };
    XLSX.utils.book_append_sheet(wb, wsVend, 'PorVendedor');

    // Sheet Por Forma
    const wsForma = XLSX.utils.json_to_sheet(porForma.map(r => ({ Forma: r.key, Pedidos: r.pedidos, Total: Number(r.total.toFixed(2)) })));
    // @ts-ignore
    (wsForma as any)['!freeze'] = { rows: 1 };
    XLSX.utils.book_append_sheet(wb, wsForma, 'PorForma');

    // Sheet Por Canal
    const wsCanal = XLSX.utils.json_to_sheet(porCanal.map(r => ({ Canal: r.key, Pedidos: r.pedidos, Total: Number(r.total.toFixed(2)) })));
    // @ts-ignore
    (wsCanal as any)['!freeze'] = { rows: 1 };
    XLSX.utils.book_append_sheet(wb, wsCanal, 'PorCanal');

    // Sheet Por Dia
    const wsDia = XLSX.utils.json_to_sheet(porDia.map(r => ({ Dia: r.key, Pedidos: r.pedidos, Total: Number(r.total.toFixed(2)) })));
    // @ts-ignore
    (wsDia as any)['!freeze'] = { rows: 1 };
    XLSX.utils.book_append_sheet(wb, wsDia, 'PorDia');

    XLSX.writeFile(wb, `relatorios_${new Date().toISOString().slice(0,10)}.xlsx`);
  }, [filtered, filters, porVendedor, porForma, porCanal, porDia]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Relatórios" }]} />
          <h1 className="text-2xl md:text-3xl font-black">Relatórios</h1>
          <p className="text-sm text-slate-500">Analise vendas por período, vendedor, forma de pagamento e canal de venda.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Recarregar</button>
          <button onClick={exportCSV} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Exportar CSV</button>
          <button onClick={exportXLSX} className="px-3 py-2 rounded bg-[var(--brand)] text-white text-sm">Exportar XLSX</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 min-w-14">De</label>
          <input value={filters.from} onChange={e=>set({ from: e.target.value })} type="date" className="px-2 py-1.5 rounded border border-[var(--border)] bg-transparent text-sm w-full" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 min-w-14">Até</label>
          <input value={filters.to} onChange={e=>set({ to: e.target.value })} type="date" className="px-2 py-1.5 rounded border border-[var(--border)] bg-transparent text-sm w-full" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 min-w-14">Vendedor</label>
          <select
            value={filters.seller}
            onChange={e=>set({ seller: e.target.value })}
            className="px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="">Todos</option>
            {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 min-w-14">Forma</label>
          <select
            value={filters.forma}
            onChange={e=>set({ forma: e.target.value })}
            className="px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="">Todas</option>
            {formas.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 min-w-14">Canal</label>
          <select
            value={filters.canal}
            onChange={e=>set({ canal: e.target.value })}
            className="px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="">Todos</option>
            {canais.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => set({ from: '', to: '', seller: '', forma: '', canal: '' })} className="px-2 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-xs">Limpar</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Faturamento" value={`R$ ${kpis.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitle="Período filtrado"/>
        <KpiCard title="Pedidos" value={String(kpis.pedidos)} subtitle="Qtde no período"/>
        <KpiCard title="Ticket Médio" value={`R$ ${kpis.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitle="Total / Pedidos"/>
        <KpiCard title="Média por Dia" value={`R$ ${kpis.mediaDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} subtitle="Soma / dias"/>
      </div>

      {/* Seções de análise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Por Vendedor">
          <GroupedTable rows={porVendedor} max={maxVendedor} labelHeader="Vendedor" />
        </Card>
        <Card title="Por Forma de Pagamento">
          <GroupedTable rows={porForma} max={maxForma} labelHeader="Forma" />
        </Card>
        <Card title="Por Canal de Venda">
          <GroupedTable rows={porCanal} max={maxCanal} labelHeader="Canal" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card title="Por Dia">
          <GroupedTable rows={porDia} max={maxDia} labelHeader="Dia" />
        </Card>
      </div>

      {/* Tabela detalhada opcional */}
      <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden">
        <div className="p-3 border-b border-[var(--border)] font-semibold flex items-center justify-between">
          <span>Vendas detalhadas ({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Contato</th>
                <th className="text-left p-3">Endereço</th>
                <th className="text-left p-3">Vendedor</th>
                <th className="text-left p-3">Forma</th>
                <th className="text-left p-3">Canal</th>
                <th className="text-left p-3">Itens</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={`${(v.createdAt||'')}-${v.id}`} className="border-t border-[var(--border)]">
                  <td className="p-3">#{v.id}</td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{v.cliente}</div>
                      {v.telefone && <div className="text-xs text-slate-500">{v.telefone}</div>}
                    </div>
                  </td>
                  <td className="p-3">
                    {v.cep && <div className="text-xs">{v.cep}</div>}
                  </td>
                  <td className="p-3">
                    {v.endereco && (
                      <div className="text-xs text-slate-400 truncate max-w-[200px]" title={v.endereco}>
                        {v.endereco}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{v.vendedor}</td>
                  <td className="p-3">{v.forma}</td>
                  <td className="p-3">{v.canal || 'Local'}</td>
                  <td className="p-3 text-slate-400 truncate max-w-[200px]" title={v.itens.join(', ')}>{v.itens.join(', ')}</td>
                  <td className="p-3 text-right font-semibold text-[var(--brand)]">R$ {v.total.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <div>
                      <div>{(v.createdAt||'').slice(0,10)}</div>
                      <div className="text-xs text-slate-500">{v.data}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden">
      <div className="p-3 border-b border-[var(--border)] font-semibold flex items-center justify-between">
        <span>{title}</span>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

function GroupedTable({ rows, max, labelHeader }: { rows: GroupRow[]; max: number; labelHeader: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)]">
          <tr>
            <th className="text-left p-3">{labelHeader}</th>
            <th className="text-right p-3">Pedidos</th>
            <th className="text-right p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-t border-[var(--border)]">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="w-[10ch] truncate" title={r.key}>{r.key}</span>
                  <div className="flex-1 h-2 bg-[var(--muted)] rounded">
                    <div className="h-2 bg-[var(--brand)] rounded" style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }} />
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">{r.pedidos}</td>
              <td className="p-3 text-right font-semibold">R$ {r.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="p-3 text-center text-slate-500">Sem dados para os filtros selecionados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
