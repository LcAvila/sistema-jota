"use client";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/store/toast";

const STORAGE_KEY = "admin_config";

export default function ConfiguracoesPage() {
  const { success, error: showError, info } = useToast();
  const [primary, setPrimary] = useState("#0f172a");
  const [accent, setAccent] = useState("#22c55e");
  const [bypass, setBypass] = useState<boolean>(false);
  const [vendedores, setVendedores] = useState<string[]>(["Lucas", "Maria", "João"]);
  const [formas, setFormas] = useState<string[]>(["Dinheiro", "Pix", "Cartão"]);
  const [novoVend, setNovoVend] = useState("");
  const [novaForma, setNovaForma] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.primary) setPrimary(cfg.primary);
        if (cfg.accent) setAccent(cfg.accent);
        if (typeof cfg.bypass === 'boolean') setBypass(cfg.bypass);
        if (Array.isArray(cfg.vendedores)) setVendedores(cfg.vendedores);
        if (Array.isArray(cfg.formas)) setFormas(cfg.formas);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const cfg = { primary, accent, bypass, vendedores, formas };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    // aplica cores na raiz do documento para refletir no app
    if (typeof document !== 'undefined') {
      const r = document.documentElement;
      r.style.setProperty('--primary', primary);
      r.style.setProperty('--accent', accent);
    }
  }, [primary, accent, bypass, vendedores, formas]);

  function addVendedor() {
    const v = novoVend.trim();
    if (!v) { showError("Informe um nome de vendedor"); return; }
    if (vendedores.includes(v)) { info("Vendedor já cadastrado"); return; }
    setVendedores((arr) => [...arr, v]);
    setNovoVend("");
    success("Vendedor adicionado");
  }
  function rmVendedor(v: string) {
    setVendedores((arr) => arr.filter((x) => x !== v));
    info(`Vendedor removido: ${v}`);
  }

  function addForma() {
    const f = novaForma.trim();
    if (!f) { showError("Informe uma forma de pagamento"); return; }
    if (formas.includes(f)) { info("Forma de pagamento já existe"); return; }
    setFormas((arr) => [...arr, f]);
    setNovaForma("");
    success("Forma de pagamento adicionada");
  }
  function rmForma(f: string) {
    setFormas((arr) => arr.filter((x) => x !== f));
    info(`Forma removida: ${f}`);
  }

  return (
    <div className="p-4 space-y-6">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Configurações" }]} />
      <h1 className="text-lg font-semibold">Configurações</h1>

      <section className="space-y-3">
        <h2 className="font-medium">Tema</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm">Primária</label>
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          <label className="text-sm">Acento</label>
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Autenticação</h2>
        <div className="flex items-center gap-2">
          <input id="bypass" type="checkbox" checked={bypass} onChange={(e) => setBypass(e.target.checked)} />
          <label htmlFor="bypass" className="text-sm">Ignorar login (bypass) no frontend</label>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">Observação: em produção, mantenha desativado e use SSO/credenciais.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Vendedores</h2>
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)]">Novo vendedor</label>
            <input value={novoVend} onChange={(e)=>setNovoVend(e.target.value)} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm" />
          </div>
          <button onClick={addVendedor} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Adicionar</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {vendedores.map(v => (
            <span key={v} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-[var(--border)]">
              {v}
              <button onClick={() => rmVendedor(v)} className="text-[var(--destructive)]">×</button>
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Formas de pagamento</h2>
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)]">Nova forma</label>
            <input value={novaForma} onChange={(e)=>setNovaForma(e.target.value)} className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm" />
          </div>
          <button onClick={addForma} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Adicionar</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formas.map(f => (
            <span key={f} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-[var(--border)]">
              {f}
              <button onClick={() => rmForma(f)} className="text-[var(--destructive)]">×</button>
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Persistência</h2>
        <button onClick={() => { localStorage.clear(); success("Storage limpo com sucesso"); }} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Limpar localStorage</button>
        <p className="text-xs text-[var(--muted-foreground)]">Use com cautela: irá exigir novo login e resetará dados locais (vendas, filtros, produtos).</p>
      </section>
    </div>
  );
}
