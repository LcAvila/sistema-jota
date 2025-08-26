"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/store/toast";
import { Search, Plus, Minus, ShoppingCart, User, Phone, CreditCard, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Produto = { id: number; nome: string; preco: number; estoque?: number; categoria?: string; image?: string; ativo?: boolean };
type Cliente = { id: number; nome: string; telefone?: string; email?: string };
type ItemVenda = { produto: Produto; quantidade: number; precoUnitario: number };

function parseNumberBR(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  const s = String(v).trim().replace(/\s+/g, " ");
  if (!s) return null;
  const br = s.replace(/\./g, "").replace(/,/, ".");
  const n = Number(br);
  return isFinite(n) ? n : null;
}

export default function CadastroVendasPage() {
  const { success, error: showError, info } = useToast();
  const router = useRouter();
  
  // Estados do formulário
  const [cliente, setCliente] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [searchProduto, setSearchProduto] = useState<string>("");
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<string>("Dinheiro");
  const [observacoes, setObservacoes] = useState<string>("");
  const [desconto, setDesconto] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Estados de dados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedorLogado, setVendedorLogado] = useState<string>("Vendedor");
  
  // Estados de UI
  const [showProdutos, setShowProdutos] = useState<boolean>(false);

  // Produtos filtrados para busca
  const produtosFiltrados = useMemo(() => {
    if (!searchProduto.trim()) return produtos.slice(0, 10);
    return produtos.filter(p => 
      p.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
      String(p.id).includes(searchProduto)
    ).slice(0, 10);
  }, [produtos, searchProduto]);
  
  // Clientes filtrados para autocompletar
  const clientesFiltrados = useMemo(() => {
    if (!cliente.trim()) return [];
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(cliente.toLowerCase())
    ).slice(0, 5);
  }, [clientes, cliente]);
  
  // Cálculos da venda
  const subtotal = useMemo(() => {
    return itensVenda.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
  }, [itensVenda]);
  
  const descontoNum = useMemo(() => {
    return (parseNumberBR(desconto) ?? Number(desconto || 0)) || 0;
  }, [desconto]);
  
  const total = useMemo(() => {
    return Math.max(0, subtotal - descontoNum);
  }, [subtotal, descontoNum]);

  // Carregar dados iniciais
  useEffect(() => {
    loadProdutos();
    loadClientes();
    loadVendedorLogado();
  }, []);
  
  const loadProdutos = useCallback(async () => {
    const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    // Normaliza para evitar http://.../api/api/products
    const baseUrl = rawBase.replace(/\/?api\/?$/, "");
    const token = getToken();
    try {
      const resp = await fetch(`${baseUrl}/api/products`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (resp.status === 401) {
        throw new Error('Não autenticado. Faça login para carregar os produtos.');
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // Mapear backend -> Produto local
      const mapped: Produto[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: p.id,
        nome: p.name,
        preco: Number(p.price) || 0,
        estoque: typeof p.stock === 'number' ? p.stock : undefined,
        categoria: p.category?.name,
        image: p.imageUrl || p.image || undefined,
        ativo: p.active !== false,
      }));
      const list = mapped.filter(p => p && (p.ativo ?? true)).sort((a,b) => a.nome.localeCompare(b.nome));
      setProdutos(list);
      if (list.length > 0) setShowProdutos(true);
      // cache local para fallback
      try { localStorage.setItem('admin_produtos', JSON.stringify(list)); } catch {}
    } catch (e: any) {
      if (e?.message && /não autenticado/i.test(e.message)) {
        // feedback rápido
        try { console.warn(e.message); } catch {}
      }
      // Fallback: tentar cache local
      try {
        const raw = localStorage.getItem('admin_produtos');
        if (raw) {
          const arr = JSON.parse(raw) as Produto[];
          if (Array.isArray(arr)) {
            const list = arr.filter(p => p && (p.ativo ?? true)).sort((a,b) => a.nome.localeCompare(b.nome));
            setProdutos(list);
            if (list.length > 0) setShowProdutos(true);
            return;
          }
        }
      } catch {}
      setProdutos([]);
    }
  }, []);
  
  const loadClientes = useCallback(() => {
    try {
      const raw = localStorage.getItem('admin_clientes');
      if (raw) {
        const arr = JSON.parse(raw) as Cliente[];
        if (Array.isArray(arr)) {
          setClientes(arr);
          return;
        }
      }
      setClientes([]);
    } catch { setClientes([]); }
  }, []);
  
  const loadVendedorLogado = useCallback(() => {
    try {
      const raw = localStorage.getItem('admin_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        if (cfg.vendedorAtual) {
          setVendedorLogado(cfg.vendedorAtual);
        }
      }
    } catch {}
  }, []);

  // Funções de manipulação de itens
  const adicionarProduto = useCallback((produto: Produto) => {
    const itemExistente = itensVenda.find(item => item.produto.id === produto.id);
    
    if (itemExistente) {
      setItensVenda(prev => prev.map(item => 
        item.produto.id === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setItensVenda(prev => [...prev, {
        produto,
        quantidade: 1,
        precoUnitario: produto.preco
      }]);
    }
    
    setSearchProduto("");
    setShowProdutos(false);
  }, [itensVenda]);
  
  const alterarQuantidade = useCallback((produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setItensVenda(prev => prev.filter(item => item.produto.id !== produtoId));
    } else {
      setItensVenda(prev => prev.map(item => 
        item.produto.id === produtoId 
          ? { ...item, quantidade: novaQuantidade }
          : item
      ));
    }
  }, []);
  
  const removerItem = useCallback((produtoId: number) => {
    setItensVenda(prev => prev.filter(item => item.produto.id !== produtoId));
  }, []);

  // Função para salvar venda
  const salvarVenda = useCallback(async () => {
    if (!cliente.trim()) {
      showError("Nome do cliente é obrigatório");
      return;
    }
    
    if (itensVenda.length === 0) {
      showError("Adicione pelo menos um produto à venda");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        clientId: null, // será criado no backend se não existir
        sellerId: null, // será obtido do token no backend
        items: itensVenda.map(item => ({
          productId: item.produto.id,
          quantity: item.quantidade,
          unitPrice: item.precoUnitario
        })),
        paymentMethodId: 1, // PIX por padrão
        notes: observacoes || null
      };
      
      // Simular criação do cliente se não existir
      const clienteData = {
        name: cliente.trim(),
        phone: telefone.trim() || null,
        email: null
      };
      
      const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const baseUrl = rawBase.replace(/\/?api\/?$/, "");
      const token = getToken();
      
      // Mapear produtos para o formato esperado pelo backend
      const payloadWithProducts = {
        cliente: clienteData,
        items: itensVenda.map(item => ({
          productId: item.produto.id,
          quantity: item.quantidade,
          unitPrice: item.precoUnitario,
          productName: item.produto.nome // Adicionar nome para facilitar no backend
        })),
        paymentMethodId: formaPagamento === 'PIX' ? 1 : formaPagamento === 'Dinheiro' ? 2 : formaPagamento === 'Cartão' ? 3 : 1,
        notes: observacoes || null,
        vendedor: vendedorLogado || 'Admin Sistema'
      };

      let response;
      let backendSuccess = false;
      
      try {
        response = await fetch(`${baseUrl}/api/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payloadWithProducts),
        });
        
        if (response.ok) {
          backendSuccess = true;
          console.log('✅ Venda enviada para o backend com sucesso');
        } else {
          console.log('⚠️ Backend retornou erro:', response.status);
        }
      } catch (e) {
        console.log('⚠️ Erro de conexão com backend:', e);
      }
      // Sempre salvar no localStorage independente do backend
      const createdAt = new Date().toISOString();
      const dt = new Date(createdAt);
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      
      const vendaLocal = {
        id: Date.now(),
        cliente: cliente.trim(),
        itens: itensVenda.map(it => `${it.quantidade}x ${it.produto.nome}`),
        total: total,
        vendedor: vendedorLogado || 'Admin Sistema',
        forma: formaPagamento || 'PIX',
        data: `${hh}:${mm}`,
        createdAt,
      };
      
      // Salvar no localStorage
      try {
        const raw = localStorage.getItem('admin_vendas');
        const arr = raw ? JSON.parse(raw) : [];
        const novo = Array.isArray(arr) ? [vendaLocal, ...arr] : [vendaLocal];
        localStorage.setItem('admin_vendas', JSON.stringify(novo.slice(0, 1000)));
        console.log('✅ Venda salva no localStorage:', vendaLocal);
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }
      
      // Tentar ler resposta do backend se disponível
      if (backendSuccess && response) {
        try {
          const created = await response.json();
          console.log('✅ Resposta do backend:', created);
        } catch (e) {
          console.log('⚠️ Erro ao ler resposta do backend:', e);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        limparFormulario();
        try { router.push('/admin/relatorios'); } catch {}
      }, 500);
      
    } catch (error: any) {
      console.error('Erro ao salvar venda:', error);
      showError(error.message || 'Erro ao salvar venda');
    } finally {
      setIsLoading(false);
    }
  }, [cliente, telefone, itensVenda, observacoes, showError]);
  
  const limparFormulario = useCallback(() => {
    setCliente("");
    setTelefone("");
    setItensVenda([]);
    setObservacoes("");
    setDesconto("0");
    setSearchProduto("");
  }, []);

  // Função para selecionar cliente do autocompletar
  const selecionarCliente = useCallback((clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado.nome);
    setTelefone(clienteSelecionado.telefone || "");
  }, []);

  // Opções de forma de pagamento
  const paymentMethods = useMemo(() => ["Dinheiro", "PIX", "Cartão"] as const, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">Cadastro de Venda</h1>
        <div className="text-sm text-muted-foreground mt-1">Vendedor: {vendedorLogado || "-"}</div>
      </div>

      {/* Cliente */}
      <div className="space-y-2 mb-6">
        <label className="text-sm font-semibold text-[var(--foreground)]">Cliente</label>
        <div className="relative">
          <Input
            placeholder="Nome do cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="bg-[var(--card)] border-[var(--border)]"
          />
          {/* Autocomplete clientes */}
          {clientesFiltrados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md">
              {clientesFiltrados.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selecionarCliente(c)}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--muted)]"
                >
                  {c.nome}{c.telefone ? ` • ${c.telefone}` : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Coluna esquerda */}
        <div className="space-y-6">
          {/* Busca de produtos */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--foreground)]">Produtos</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar produto"
                  value={searchProduto}
                  onChange={(e) => setSearchProduto(e.target.value)}
                  className="pl-9 pr-10 bg-[var(--card)] border-[var(--border)]"
                  onFocus={() => setShowProdutos(true)}
                  onBlur={() => setTimeout(() => setShowProdutos(false), 100)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowProdutos(!showProdutos)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className={`h-4 w-4 transition-transform ${showProdutos ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showProdutos && produtosFiltrados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md max-h-64 overflow-auto">
                    {produtosFiltrados.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => adicionarProduto(p)}
                        className="w-full text-left px-3 py-2 hover:bg-[var(--muted)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate">{p.nome}</span>
                          <span className="text-sm font-semibold">{p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                className="bg-brand hover:bg-brand/90"
                onClick={() => produtosFiltrados[0] && adicionarProduto(produtosFiltrados[0])}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Tabela de itens */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_140px_140px_40px] items-center text-sm font-semibold text-muted-foreground px-2">
              <div>Produto</div>
              <div className="text-center">Quantidade</div>
              <div className="text-right">Preço</div>
              <div></div>
            </div>
            <Card variant="outline" className="overflow-hidden">
              <CardContent className="p-0 divide-y divide-[var(--border)]">
                {itensVenda.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Nenhum produto adicionado.</div>
                ) : (
                  itensVenda.map((item) => (
                    <div key={item.produto.id} className="grid grid-cols-[1fr_140px_140px_40px] items-center gap-2 p-2">
                      <div className="truncate">
                        <div className="font-medium">{item.produto.nome}</div>
                        <div className="text-xs text-muted-foreground">Unitário: {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          value={item.quantidade}
                          onChange={(e) => {
                            const v = parseInt(e.target.value || "0", 10);
                            alterarQuantidade(item.produto.id, isNaN(v) ? 0 : v);
                          }}
                          className="h-8 w-16 text-center"
                          type="number"
                          min={0}
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right font-semibold">
                        {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removerItem(item.produto.id)} aria-label="Remover">
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Input
              placeholder="Observações (opcional)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="bg-[var(--card)] border-[var(--border)]"
            />
          </div>

          {/* Ações */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button type="button" variant="outline" className="h-11" onClick={limparFormulario}>Cancelar</Button>
            <Button 
              type="button" 
              className="h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading} 
              onClick={salvarVenda}
            >
              {isLoading ? 'Salvando...' : '💾 Salvar venda'}
            </Button>
            <Button
              type="button"
              className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
              onClick={async () => { await salvarVenda(); setTimeout(() => window.print(), 300); }}
            >
              {isLoading ? 'Salvando...' : '🖨️ Salvar e imprimir'}
            </Button>
          </div>
        </div>

        {/* Coluna direita - pagamento e resumo */}
        <div className="space-y-6">
          {/* Forma de pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--foreground)]">Forma de pagamento</label>
            <Card variant="outline">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {paymentMethods.map((fp) => (
                    <label key={fp} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fp"
                        className="accent-[var(--brand)]"
                        checked={(formaPagamento || "PIX") === fp}
                        onChange={() => setFormaPagamento(fp)}
                      />
                      <span>{fp}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Card variant="outline">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <Input
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                    className="h-8 w-28 text-right"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-extrabold">
                  <span>Total:</span>
                  <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
