"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria?: string;
  ativo: boolean;
  image?: string; // url relativo em public (ex: /assets/produtos/x.png)
  code?: string; // código único no banco
};

const STORAGE_KEY = "admin_produtos";

export default function ProdutosPage() {
  const { success, error } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [editing, setEditing] = useState<Produto | null>(null);
  const [form, setForm] = useState<Produto>({ id: 1, nome: "", preco: 0, estoque: 0, categoria: "", ativo: true, image: "", code: "" });
  const [preview, setPreview] = useState<Produto[] | null>(null);
  const [previewIssues, setPreviewIssues] = useState<string[][]>([]);
  const [importName, setImportName] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const [importHeaders, setImportHeaders] = useState<string[] | null>(null);
  const [importRows, setImportRows] = useState<Record<string, any>[] | null>(null);
  const [mapping, setMapping] = useState<Record<'id'|'nome'|'preco'|'estoque'|'categoria'|'ativo', string>>({
    id: 'id', nome: 'nome', preco: 'preço', estoque: 'estoque', categoria: 'categoria', ativo: 'ativo'
  });
  const MAPPING_STORAGE_PREFIX = 'produtos_import_mapping:';
  // imagens detectadas em public/assets/produtos
  const [images, setImages] = useState<{file:string; url:string; name:string}[]>([]);
  const [imgError, setImgError] = useState<string>("");

  // Carregar do banco automaticamente ao abrir a página
  useEffect(() => {
    loadFromBackend().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sincronização ao abrir a tela (uma vez)
  // Desabilitado: sincronização automática com imagens só por ação manual
  useEffect(() => { /* no-op */ }, [images.length]);

  // Auto-importar catálogo (uma vez)
  // Desabilitado: auto-import de catálogo (agora fonte da verdade é o banco)
  useEffect(() => { /* no-op */ }, [produtos.length]);

  // buscar imagens do diretório público
  useEffect(() => {
    async function fetchImages() {
      try {
        setImgError("");
        const res = await fetch('/api/produtos/images');
        if (!res.ok) throw new Error('Falha ao listar imagens');
        const data = await res.json();
        setImages(data.images || []);
      } catch (e:any) {
        setImgError(e?.message || 'Não foi possível carregar imagens');
        setImages([]);
      }
    }
    fetchImages();
  }, []);

  function getMappingKey(headers: string[], fileName: string) {
    const sig = headers.map(h => h.trim().toLowerCase()).join('|');
    const file = (fileName || '').trim().toLowerCase();
    // chave inclui arquivo e assinatura de cabeçalhos
    return `${MAPPING_STORAGE_PREFIX}${file}::${sig}`;
  }

  function loadLastMapping(headers: string[], fileName: string) {
    try {
      const key = getMappingKey(headers, fileName);
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          setMapping((prev) => ({ ...prev, ...saved }));
          return true;
        }
      }
    } catch {}
    return false;
  }

  function saveLastMapping(headers: string[], fileName: string, map: typeof mapping) {
    try {
      const key = getMappingKey(headers, fileName);
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
  }

  function validateProduto(p: Produto): string[] {
    const errs: string[] = [];
    if (!p.nome?.trim()) errs.push('Nome vazio');
    if (!(Number.isFinite(p.preco) && p.preco >= 0)) errs.push('Preço inválido');
    if (!Number.isFinite(p.estoque) || p.estoque < 0 || !Number.isInteger(p.estoque)) errs.push('Estoque inválido');
    // categoria opcional; ativo já booleano
    return errs;
  }

  function setPreviewWithValidation(records: Produto[]) {
    setPreview(records);
    const issues = records.map(validateProduto);
    setPreviewIssues(issues);
  }
  

  // Parar de persistir em localStorage (fonte é o banco)
  useEffect(() => { /* no-op */ }, [produtos]);

  const categorias = useMemo(() => {
    return Array.from(new Set(produtos.map((p) => p.categoria || "") )).filter(Boolean);
  }, [produtos]);

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      const txt = filtro.trim().toLowerCase();
      const okTxt = !txt || [p.nome, p.categoria].filter(Boolean).some((v) => String(v).toLowerCase().includes(txt));
      const okCat = !categoriaFiltro || (p.categoria || "") === categoriaFiltro;
      return okTxt && okCat;
    });
  }, [produtos, filtro, categoriaFiltro]);

  function resetForm() {
    const maxId = produtos.reduce((m, p) => Math.max(m, p.id), 0);
    setForm({ id: maxId + 1, nome: "", preco: 0, estoque: 0, categoria: "", ativo: true, image: "", code: "" });
    setEditing(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!form.nome.trim()) { error('Informe o nome'); return; }
      if (!form.code?.trim()) { error('Informe o código do produto'); return; }
      if (editing) {
        // Atualizar no banco
        const resp = await apiFetch(`/products/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.nome,
            price: Number(form.preco),
            stock: Number.isFinite(form.estoque) ? Number(form.estoque) : 0,
            categoryName: form.categoria || undefined,
            imageUrl: form.image || undefined,
            active: !!form.ativo,
            code: form.code,
          }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(()=>({}));
          throw new Error(j?.error || `Falha ao salvar (${resp.status})`);
        }
        success('Produto atualizado');
        await loadFromBackend();
        resetForm();
      } else {
        // Criar no banco
        const resp = await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify({
            name: form.nome,
            price: Number(form.preco),
            stock: Number.isInteger(form.estoque) ? form.estoque : 0,
            categoryName: form.categoria || undefined,
            imageUrl: form.image || undefined,
            active: !!form.ativo,
            code: form.code,
          }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(()=>({}));
          throw new Error(j?.error || `Falha ao criar (${resp.status})`);
        }
        success('Produto criado no banco');
        await loadFromBackend();
        resetForm();
      }
    } catch (e:any) {
      error(e?.message || 'Erro ao salvar produto');
    }
  }

  function onEdit(p: Produto) {
    setEditing(p);
    setForm({ ...p });
  }

  async function onDelete(id: number) {
    if (!confirm("Remover produto?")) return;
    try {
      const resp = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error(`Falha ao remover (${resp.status})`);
      success('Produto removido');
      await loadFromBackend();
      if (editing?.id === id) resetForm();
    } catch (e:any) { error(e?.message || 'Erro ao remover produto'); }
  }

  function exportCSV() {
    const header = ["ID", "Nome", "Preço", "Estoque", "Categoria", "Ativo"];
    const rows = filtrados.map((p) => [p.id, p.nome, p.preco.toFixed(2), p.estoque, p.categoria || "", p.ativo ? "Sim" : "Não"]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produtos_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function parseNumber(val: any): number {
    if (val == null) return 0;
    const s = String(val).replace(/\./g, '').replace(',', '.').trim();
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  function parseBool(val: any): boolean {
    const s = String(val).trim().toLowerCase();
    return s === 'sim' || s === 'true' || s === '1' || s === 'yes';
  }

  function mapRecordToProduto(obj: Record<string, any>, fallbackId: number): Produto {
    const keys = Object.fromEntries(Object.keys(obj).map(k => [k.toLowerCase(), k]));
    const get = (name: string) => obj[keys[name]];
    const idRaw = get('id');
    const id = idRaw != null && String(idRaw).trim() !== '' ? Number(idRaw) : fallbackId;
    return {
      id: isNaN(id) ? fallbackId : id,
      nome: String(get('nome') ?? obj['Nome'] ?? obj['name'] ?? '').trim(),
      preco: parseNumber(get('preço') ?? get('preco') ?? obj['Preço'] ?? obj['price']),
      estoque: Number(get('estoque') ?? obj['Estoque'] ?? 0) || 0,
      categoria: String(get('categoria') ?? obj['Categoria'] ?? '').trim() || undefined,
      ativo: obj[keys['ativo']] != null ? parseBool(get('ativo')) : true,
    };
  }

  function autoMapping(headers: string[]) {
    const lower = headers.map(h => h.toLowerCase());
    const find = (...alts: string[]) => {
      for (const a of alts) { const i = lower.indexOf(a); if (i>=0) return headers[i]; }
      return '';
    };
    setMapping({
      id: find('id', 'codigo', 'código'),
      nome: find('nome', 'name', 'produto', 'descrição', 'descricao'),
      preco: find('preço', 'preco', 'price', 'valor'),
      estoque: find('estoque', 'qtd', 'quantidade'),
      categoria: find('categoria', 'categoria/ncm', 'grupo'),
      ativo: find('ativo', 'habilitado', 'status'),
    });
  }

  function applyMappingToRows(rows: Record<string, any>[]) : Produto[] {
    let nextId = produtos.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const records: Produto[] = [];
    for (const r of rows) {
      // monta obj com chaves normalizadas conforme mapping
      const obj: Record<string, any> = {};
      Object.entries(mapping).forEach(([field, head]) => {
        if (head && r.hasOwnProperty(head)) obj[field] = r[head as string];
      });
      const prod = mapRecordToProduto(obj, nextId);
      if (!prod.nome) continue;
      if (isNaN(prod.id) || produtos.some(p => p.id === prod.id) || records.some(p => p.id === prod.id)) {
        prod.id = nextId++;
      } else {
        nextId = Math.max(nextId, prod.id + 1);
      }
      records.push(prod);
    }
    return records;
  }

  async function handleImportFile(file: File) {
    setImportError("");
    setImportName(file.name);
    setPreview(null);
    setPreviewIssues([]);
    setImportHeaders(null);
    setImportRows(null);
    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        // CSV com separador ";" e aspas
        const lines = text.split(/\r?\n/).filter(l => l.trim().length);
        if (lines.length === 0) throw new Error('CSV vazio');
        const parseCSVRow = (line: string): string[] => {
          const out: string[] = [];
          let cur = '';
          let inQ = false;
          for (let i=0;i<line.length;i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQ && line[i+1] === '"') { cur += '"'; i++; }
              else inQ = !inQ;
            } else if (ch === ';' && !inQ) {
              out.push(cur); cur='';
            } else {
              cur += ch;
            }
          }
          out.push(cur);
          return out.map(s => s.trim());
        };
        const header = parseCSVRow(lines[0]);
        const rows: Record<string, any>[] = [];
        for (let li=1; li<lines.length; li++) {
          const cols = parseCSVRow(lines[li]);
          const obj: Record<string, any> = {};
          header.forEach((h, i) => { obj[h] = cols[i]; });
          rows.push(obj);
        }
        setImportHeaders(header);
        setImportRows(rows);
        if (!loadLastMapping(header, file.name)) autoMapping(header);
      } else if (/\.(xlsx|xls)$/i.test(file.name)) {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[];
        const headers = Object.keys(json[0] || {});
        setImportHeaders(headers);
        setImportRows(json);
        if (!loadLastMapping(headers, file.name)) autoMapping(headers);
      } else {
        throw new Error('Formato não suportado. Use CSV, XLSX ou XLS.');
      }
    } catch (e: any) {
      setImportError(e?.message || 'Falha ao importar');
      setPreview(null);
      setImportHeaders(null);
      setImportRows(null);
    }
  }

  function commitImport(mode: 'replace' | 'append') {
    if (!preview) return;
    if (mode === 'replace') {
      setProdutos(preview);
    } else {
      // append evitando colisão de IDs com o estado atual
      let nextId = produtos.reduce((m, p) => Math.max(m, p.id), 0) + 1;
      const toAdd = preview.map((p) => {
        if (produtos.some(x => x.id === p.id)) {
          return { ...p, id: nextId++ };
        }
        nextId = Math.max(nextId, p.id + 1);
        return p;
      });
      setProdutos((list) => [...list, ...toAdd]);
    }
    setPreview(null);
    setImportName("");
    setImportError("");
    // reajusta form id
    const maxId = (mode === 'replace' ? preview : [...produtos, ...preview]).reduce((m, p) => Math.max(m, p.id), 0);
    setForm((f) => ({ ...f, id: maxId + 1 }));
  }

  // Enviar catálogo (src/data/products.ts) para o backend (banco) via bulk-import
  const CATALOG_DEFAULT_STOCK = 10;
  const CATALOG_DEFAULT_MIN_STOCK = 2;
  async function sendCatalogToBackend() {
    try {
      const mod = await import('@/data/products');
      const cat = (mod.products || []) as Array<any>;
      if (!cat.length) { error('Catálogo vazio'); return; }
      const payload = cat.map((c) => ({
        name: String(c.name || c.nome || '').trim(),
        price: Number(c.price) || 0,
        category: String(c.category || c.categoria || '').trim() || undefined,
        image: c.image ? String(c.image) : undefined,
        stock: Number.isInteger(c.stock) ? c.stock : CATALOG_DEFAULT_STOCK,
        minStock: Number.isInteger(c.minStock) ? c.minStock : CATALOG_DEFAULT_MIN_STOCK,
        unit: c.unit || null,
        active: c.active !== false,
        barcode: c.barcode || undefined,
      }));
      // filtra nomes vazios
      const list = payload.filter(p => p.name);
      if (!list.length) { error('Nenhum produto válido para importar'); return; }
      const resp = await apiFetch('/products/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ products: list }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || `Falha ao importar (${resp.status})`);
      }
      const j = await resp.json();
      success(`Importados ${j?.count || list.length} produtos no banco`);
    } catch (e: any) {
      error(e?.message || 'Erro ao enviar catálogo');
    }
  }

  // Sincronizar produtos com imagens encontradas em public/assets/produtos
  function normalizeName(name: string) {
    return name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const DEFAULT_PRICE = 49.9;
  const DEFAULT_STOCK = 10;
  async function importFromCatalog() {
    try {
      const mod = await import('@/data/products');
      const cat = (mod.products || []) as Array<any>;
      if (!cat.length) return;
      setProdutos((list) => {
        let nextId = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
        const existingIds = new Set(list.map(p => p.id));
        const existingNames = new Set(list.map(p => p.nome.toLowerCase()));
        const mapped: Produto[] = [];
        for (const c of cat) {
          let id = Number(c.id);
          if (!Number.isInteger(id) || existingIds.has(id) || mapped.some(p=>p.id===id)) {
            id = nextId++;
          }
          const nome = String(c.name || c.nome || '').trim();
          if (!nome) continue;
          const preco = Number(c.price) || DEFAULT_PRICE;
          const categoria = String(c.category || c.categoria || '').trim();
          const image = c.image ? String(c.image) : undefined;
          const ativo = true;
          const estoque = DEFAULT_STOCK;
          // evita duplicar por nome exato
          if (existingNames.has(nome.toLowerCase()) || mapped.some(p=>p.nome.toLowerCase()===nome.toLowerCase())) {
            continue;
          }
          mapped.push({ id, nome, preco, estoque, categoria, ativo, image });
        }
        return [...list, ...mapped];
      });
      // reajusta form id após merge
      const maxId = (produtos || []).reduce((m, p) => Math.max(m, p.id), 0);
      setForm((f) => ({ ...f, id: maxId + 1 }));
    } catch (e) {
      console.error('Falha ao importar catálogo', e);
    }
  }
  function syncFromImages() {
    if (!images.length) return;
    const list: Produto[] = [...produtos];
    let nextId = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const byName = new Map(list.map(p => [p.nome.toLowerCase(), p] as const));
    for (const img of images) {
      const pretty = normalizeName(img.name);
      const existing = byName.get(pretty.toLowerCase());
      if (existing) {
        if (!existing.image) existing.image = img.url;
        if (!existing.preco || existing.preco <= 0) existing.preco = DEFAULT_PRICE;
        if (!Number.isFinite(existing.estoque) || existing.estoque <= 0) existing.estoque = DEFAULT_STOCK;
      } else {
        list.push({ id: nextId++, nome: pretty, preco: DEFAULT_PRICE, estoque: DEFAULT_STOCK, categoria: '', ativo: true, image: img.url });
      }
    }
    setProdutos(list);
    const maxId = list.reduce((m, p) => Math.max(m, p.id), 0);
    setForm((f) => ({ ...f, id: maxId + 1 }));
  }

  // Carregar todos os produtos do banco (estoque) para a aba Produtos
  async function loadFromBackend() {
    try {
      const resp = await apiFetch('/products');
      if (!resp.ok) throw new Error(`Falha ao carregar (${resp.status})`);
      const data = await resp.json();
      const list: Produto[] = (Array.isArray(data) ? data : data?.items || []).map((p: any) => ({
        id: Number(p.id),
        nome: String(p.name || p.nome || '').trim(),
        preco: Number(p.price) || 0,
        estoque: Number.isFinite(p.stock) ? Number(p.stock) : 0,
        categoria: (p.category?.name || p.category?.title || p.category || '').trim() || undefined,
        ativo: p.active !== false,
        image: p.image || p.imageUrl || undefined,
        code: p.code,
      }));
      setProdutos(list);
      const maxId = list.reduce((m, p) => Math.max(m, p.id), 0);
      setForm((f) => ({ ...f, id: maxId + 1 }));
      success(`Carregados ${list.length} produtos do banco`);
    } catch (e: any) {
      error(e?.message || 'Erro ao carregar produtos do banco');
    }
  }

  // Salvar preço e estoque de um produto no banco
  async function saveRowToBackend(p: Produto) {
    try {
      const resp = await apiFetch(`/products/${p.id}`, {
        method: 'PUT',
        body: JSON.stringify({ price: p.preco, stock: p.estoque }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || `Falha ao salvar (${resp.status})`);
      }
      success('Produto atualizado no banco');
    } catch (e: any) {
      error(e?.message || 'Erro ao salvar produto');
    }
  }

  // Definir preço padrão para itens sem preço
  function setDefaultPricesForZero(defaultPrice = 49.9) {
    let count = 0;
    setProdutos(list => list.map(p => {
      if (!(Number.isFinite(p.preco)) || p.preco <= 0) { count++; return { ...p, preco: defaultPrice }; }
      return p;
    }));
    if (count > 0) success(`Preços definidos para ${count} produto(s)`); else error('Nenhum produto com preço zerado');
  }

  // Salvar todos os itens listados no banco (preço e estoque)
  async function saveAllToBackend() {
    try {
      const items = produtos;
      for (const p of items) {
        const resp = await apiFetch(`/products/${p.id}`, {
          method: 'PUT',
          body: JSON.stringify({ price: p.preco, stock: p.estoque }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || `Falha ao salvar ID ${p.id} (${resp.status})`);
        }
      }
      success(`Todos os ${items.length} produtos foram salvos no banco`);
    } catch (e: any) {
      error(e?.message || 'Erro ao salvar todos os produtos');
    }
  }

  // já carregamos no mount acima
  useEffect(() => { /* no-op */ }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Produtos</h1>
        <div className="flex items-center gap-2">
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nome ou categoria"
            className="px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="">Todas categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={() => { setFiltro(""); setCategoriaFiltro(""); }} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Limpar</button>
          <button onClick={exportCSV} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Exportar CSV</button>
          <label className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm cursor-pointer">
            Importar CSV/XLSX
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => { const f=e.target.files?.[0]; if (f) handleImportFile(f); e.currentTarget.value=''; }}
              className="hidden"
            />
          </label>
          <button onClick={() => syncFromImages()} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Sincronizar imagens</button>
          <button onClick={() => importFromCatalog()} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Importar catálogo</button>
          {/* Botão removido conforme requisito: Enviar catálogo ao banco */}
          <button onClick={() => loadFromBackend()} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Carregar do banco</button>
          <button onClick={() => setDefaultPricesForZero()} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Preço padrão p/ vazios</button>
          <button onClick={() => saveAllToBackend()} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Salvar todos no banco</button>
        </div>
      </div>

      {imgError && <div className="text-sm text-[var(--destructive)]">{imgError}</div>}

      {(importName || importError) && (
        <div className="text-sm text-slate-600 flex items-center justify-between">
          <div>
            {importName && <span>Arquivo: <strong>{importName}</strong></span>}
            {importError && <span className="ml-2 text-[var(--destructive)]">{importError}</span>}
          </div>
          {(preview || importRows) && (
            <div className="flex items-center gap-2">
              {preview ? (
                <>
                  <button disabled={previewIssues.some(i=>i.length>0)} onClick={() => commitImport('append')} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-xs disabled:opacity-50 disabled:cursor-not-allowed" title={previewIssues.some(i=>i.length>0) ? 'Corrija erros antes de importar' : ''}>Importar (Acrescentar)</button>
                  <button disabled={previewIssues.some(i=>i.length>0)} onClick={() => commitImport('replace')} className="px-3 py-1.5 rounded border border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--muted)] text-xs disabled:opacity-50 disabled:cursor-not-allowed" title={previewIssues.some(i=>i.length>0) ? 'Corrija erros antes de importar' : ''}>Importar (Substituir)</button>
                </>
              ) : (
                <>
                  <button onClick={() => { if (importRows && importHeaders) { saveLastMapping(importHeaders, importName, mapping); setPreviewWithValidation(applyMappingToRows(importRows)); } }} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-xs">Continuar</button>
                </>
              )}
              <button onClick={() => { setPreview(null); setPreviewIssues([]); setImportRows(null); setImportHeaders(null); setImportName(''); setImportError(''); }} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-xs">Cancelar</button>
            </div>
          )}
        </div>
      )}

      {/* Mapeamento manual de colunas */}
      {importRows && importHeaders && !preview && (
        <div className="border border-[var(--border)] rounded-md overflow-hidden">
          <div className="p-2 text-sm text-slate-600">Mapeie as colunas do arquivo para os campos do sistema.</div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
            {(['id','nome','preco','estoque','categoria','ativo'] as const).map((field) => (
              <div key={field} className="space-y-1">
                <div className="text-xs text-slate-500">{field.toUpperCase()}</div>
                <select value={mapping[field]} onChange={e=>setMapping(m=>({...m, [field]: e.target.value}))} className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
                  <option value="">(ignorar)</option>
                  {importHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <div className="text-[11px] text-slate-500 truncate">Ex: {String(importRows[0]?.[mapping[field]] ?? '')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="border border-[var(--border)] rounded-md overflow-hidden">
          <div className="p-2 text-sm text-slate-600">
            Pré-visualização ({preview.length} itens). Serão gerados IDs evitando colisões.
            {previewIssues.some(i=>i.length>0) && (
              <span className="ml-2 text-[var(--destructive)]">
                {previewIssues.filter(i=>i.length>0).length} linha(s) com erro.
              </span>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="text-left p-2">Imagem</th>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">Categoria</th>
                <th className="text-right p-2">Preço</th>
                <th className="text-right p-2">Estoque</th>
                <th className="text-center p-2">Ativo</th>
                <th className="text-left p-2">Erros</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 10).map((p, idx) => (
                <tr key={p.id} className={`border-t border-[var(--border)] ${previewIssues[idx]?.length ? 'bg-red-50/50' : ''}`}>
                  <td className="p-2 w-16">{p.image ? (<img src={p.image} alt={p.nome} className="w-12 h-12 object-cover rounded"/>) : (<div className="w-12 h-12 bg-[var(--muted)] rounded"/>)}</td>
                  <td className="p-2">#{p.id}</td>
                  <td className="p-2">{p.nome}</td>
                  <td className="p-2">{p.categoria}</td>
                  <td className="p-2 text-right">R$ {p.preco.toFixed(2)}</td>
                  <td className="p-2 text-right">{p.estoque}</td>
                  <td className="p-2 text-center">{p.ativo ? 'Sim' : 'Não'}</td>
                  <td className="p-2 text-left text-[11px] text-[var(--destructive)]">{previewIssues[idx]?.join('; ')}</td>
                </tr>
              ))}
              {preview.length > 10 && (
                <tr><td colSpan={8} className="p-2 text-center text-xs text-slate-500">Mostrando 10 de {preview.length} itens…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulário de criação/edição */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs text-[var(--muted-foreground)]">Nome</label>
          <input
            value={form.nome}
            onChange={(e) => {
              const nome = e.target.value;
              setForm((prev) => {
                const currentCode = (prev.code || '').trim();
                // se não há código ainda, sugere um baseado no nome
                const suggested = nome
                  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                  .toUpperCase().replace(/[^A-Z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')
                  .slice(0, 16);
                return { ...prev, nome, code: currentCode ? currentCode : suggested };
              });
            }}
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)]">Código</label>
          <input
            value={form.code || ''}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Código único do produto"
            required
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)]">Preço</label>
          <input
            type="number"
            step="0.01"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)]">Estoque</label>
          <input
            type="number"
            value={form.estoque}
            onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)]">Categoria</label>
          <input
            value={form.categoria || ""}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--border)] bg-transparent text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-[var(--muted-foreground)]">Imagem</label>
          <div className="flex items-center gap-2">
            <select
              value={form.image || ""}
              onChange={(e) => setForm({ ...form, image: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="">(sem imagem)</option>
              {images.map(img => (
                <option key={img.url} value={img.url}>{img.file}</option>
              ))}
            </select>
            {form.image ? (
              <img src={form.image} alt="preview" className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-[var(--muted)] rounded" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="ativo" type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
          <label htmlFor="ativo" className="text-sm">Ativo</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">
            {editing ? "Salvar" : "Adicionar"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-3 py-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">Cancelar</button>
          )}
        </div>
      </form>

      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left p-2">Imagem</th>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Código</th>
              <th className="text-left p-2">Categoria</th>
              <th className="text-right p-2">Preço</th>
              <th className="text-right p-2">Estoque</th>
              <th className="text-center p-2">Ativo</th>
              <th className="text-right p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <td className="p-2 w-16">{p.image ? (<img src={p.image} alt={p.nome} className="w-12 h-12 object-cover rounded"/>) : (<div className="w-12 h-12 bg-[var(--muted)] rounded"/>)}</td>
                <td className="p-2">#{p.id}</td>
                <td className="p-2">{p.nome}</td>
                <td className="p-2">{p.code || '-'}</td>
                <td className="p-2">{p.categoria}</td>
                <td className="p-2 text-right">R$ {p.preco.toFixed(2)}</td>
                <td className="p-2 text-right">{p.estoque}</td>
                <td className="p-2 text-center">{p.ativo ? "Sim" : "Não"}</td>
                <td className="p-2 text-right space-x-2">
                  <Link href={`/admin/estoque/ajuste?productId=${p.id}`} className="px-2 py-1 rounded hover:bg-[var(--muted)] text-xs whitespace-nowrap">Ajustar Estoque</Link>
                  <button onClick={() => saveRowToBackend(p)} className="px-2 py-1 rounded hover:bg-[var(--muted)] text-xs">Salvar</button>
                  <button onClick={() => onEdit(p)} className="px-2 py-1 rounded hover:bg-[var(--muted)] text-xs">Editar</button>
                  <button onClick={() => onDelete(p.id)} className="px-2 py-1 rounded hover:bg-[var(--muted)] text-xs text-[var(--destructive)]">Remover</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-[var(--muted-foreground)]">Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
