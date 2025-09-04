"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/store/toast";
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  Phone, 
  CreditCard, 
  DollarSign, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Globe, 
  Home, 
  MessageCircle,
  FileText,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  Receipt,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Produto = { id: number; nome: string; preco: number; estoque?: number; categoria?: string; image?: string; ativo?: boolean };
type Cliente = { id: number; nome: string; telefone?: string; email?: string; cep?: string; endereco?: string };
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
  const [cep, setCep] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [vendedor, setVendedor] = useState<string>("");
  const [dataVenda, setDataVenda] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchProduto, setSearchProduto] = useState<string>("");
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<string>("PIX");
  const [canalVenda, setCanalVenda] = useState<string>("Local");
  const [observacoes, setObservacoes] = useState<string>("");
  const [desconto, setDesconto] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Estados de dados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedorLogado, setVendedorLogado] = useState<string>("Vendedor");
  
  // Estados de UI
  const [showProdutos, setShowProdutos] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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
      try { localStorage.setItem('admin_produtos', JSON.stringify(list)); } catch {}
    } catch (e: any) {
      if (e?.message && /não autenticado/i.test(e.message)) {
        try { console.warn(e.message); } catch {}
      }
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
          setVendedor(cfg.vendedorAtual);
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
    
    if (!vendedor.trim()) {
      showError("Nome do vendedor é obrigatório");
      return;
    }
    
    if (itensVenda.length === 0) {
      showError("Adicione pelo menos um produto à venda");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const clienteData = {
        name: cliente.trim(),
        phone: telefone.trim() || null,
        email: null,
        cep: cep.trim() || null,
        endereco: endereco.trim() || null
      };
      
      const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const baseUrl = rawBase.replace(/\/?api\/?$/, "");
      const token = getToken();
      
      const payloadWithProducts = {
        cliente: clienteData,
        items: itensVenda.map(item => ({
          productId: item.produto.id,
          quantity: item.quantidade,
          unitPrice: item.precoUnitario,
          productName: item.produto.nome
        })),
        paymentMethod: formaPagamento,
        canalVenda: canalVenda,
        dataVenda: dataVenda,
        vendedor: vendedor.trim(),
        notes: observacoes || null,
        total: total
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
      
      const createdAt = new Date().toISOString();
      const dt = new Date(createdAt);
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      
      const vendaLocal = {
        id: Date.now(),
        cliente: cliente.trim(),
        telefone: telefone.trim() || null,
        cep: cep.trim() || null,
        endereco: endereco.trim() || null,
        itens: itensVenda.map(it => `${it.quantidade}x ${it.produto.nome}`),
        total: total,
        vendedor: vendedor.trim(),
        forma: formaPagamento,
        canal: canalVenda,
        data: dataVenda,
        hora: `${hh}:${mm}`,
        createdAt,
      };
      
      try {
        const raw = localStorage.getItem('admin_vendas');
        const arr = raw ? JSON.parse(raw) : [];
        const novo = Array.isArray(arr) ? [vendaLocal, ...arr] : [vendaLocal];
        localStorage.setItem('admin_vendas', JSON.stringify(novo.slice(0, 1000)));
        console.log('✅ Venda salva no localStorage:', vendaLocal);
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }
      
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
  }, [cliente, telefone, cep, endereco, vendedor, dataVenda, itensVenda, formaPagamento, canalVenda, observacoes, total, showError]);
  
  const limparFormulario = useCallback(() => {
    setCliente("");
    setTelefone("");
    setCep("");
    setEndereco("");
    setVendedor(vendedorLogado || "");
    setDataVenda(new Date().toISOString().split('T')[0]);
    setItensVenda([]);
    setObservacoes("");
    setDesconto("0");
    setFormaPagamento("PIX");
    setCanalVenda("Local");
    setSearchProduto("");
    setActiveStep(1);
  }, [vendedorLogado]);

  // Função para selecionar cliente do autocompletar
  const selecionarCliente = useCallback((clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado.nome);
    setTelefone(clienteSelecionado.telefone || "");
    setCep(clienteSelecionado.cep || "");
    setEndereco(clienteSelecionado.endereco || "");
  }, []);

  // Opções de forma de pagamento
  const paymentMethods = useMemo(() => ["PIX", "Dinheiro", "Cartão de Crédito", "Cartão de Débito"] as const, []);
  
  // Opções de canal de venda
  const salesChannels = useMemo(() => ["Local", "Website", "WhatsApp"] as const, []);

  // Componente de Step Indicator
  const StepIndicator = ({ step, title, isActive, isCompleted, onClick }: { step: number; title: string; isActive: boolean; isCompleted: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
        isActive 
          ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' 
          : isCompleted 
            ? 'border-[var(--chart-green)] bg-[var(--chart-green)]/10 text-[var(--chart-green)]' 
            : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--brand)]/50'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isActive 
          ? 'bg-[var(--brand)] text-white' 
          : isCompleted 
            ? 'bg-[var(--chart-green)] text-white' 
            : 'bg-[var(--muted)] text-[var(--foreground)]'
      }`}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className="font-medium">{title}</span>
    </button>
  );

  // Componente de Step Content
  const StepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-[var(--brand)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Informações do Cliente</h2>
              <p className="text-[var(--foreground)] opacity-70">Preencha os dados do cliente para esta venda</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Nome do Cliente *</label>
                <div className="relative">
                  <Input
                    placeholder="Nome completo do cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="bg-[var(--card)] border-[var(--border)] h-12"
                  />
                  {clientesFiltrados.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md">
                      {clientesFiltrados.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selecionarCliente(c)}
                          className="w-full text-left px-4 py-3 hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0"
                        >
                          <div className="font-medium">{c.nome}</div>
                          {c.telefone && <div className="text-sm text-[var(--foreground)] opacity-70">{c.telefone}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Telefone</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="bg-[var(--card)] border-[var(--border)] h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">CEP</label>
                  <Input
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="bg-[var(--card)] border-[var(--border)] h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Endereço</label>
                <Input
                  placeholder="Endereço completo"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="bg-[var(--card)] border-[var(--border)] h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Vendedor *</label>
                  <Input
                    placeholder="Nome do vendedor"
                    value={vendedor}
                    onChange={(e) => setVendedor(e.target.value)}
                    className="bg-[var(--card)] border-[var(--border)] h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Data da Venda *</label>
                  <Input
                    type="date"
                    value={dataVenda}
                    onChange={(e) => setDataVenda(e.target.value)}
                    className="bg-[var(--card)] border-[var(--border)] h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ShoppingCart className="w-16 h-16 text-[var(--chart-green)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Produtos da Venda</h2>
              <p className="text-[var(--foreground)] opacity-70">Adicione os produtos que serão vendidos</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Buscar Produto</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Digite o nome ou ID do produto"
                      value={searchProduto}
                      onChange={(e) => setSearchProduto(e.target.value)}
                      className="pl-10 pr-10 bg-[var(--card)] border-[var(--border)] h-12"
                      onFocus={() => setShowProdutos(true)}
                      onBlur={() => setTimeout(() => setShowProdutos(false), 100)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground)] opacity-50" />
                    {showProdutos && produtosFiltrados.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md max-h-64 overflow-auto">
                        {produtosFiltrados.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => adicionarProduto(p)}
                            className="w-full text-left px-4 py-3 hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{p.nome}</div>
                                {p.categoria && <div className="text-sm text-[var(--foreground)] opacity-70">{p.categoria}</div>}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-[var(--chart-green)]">
                                  {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                {p.estoque !== undefined && (
                                  <div className="text-xs text-[var(--foreground)] opacity-70">
                                    Estoque: {p.estoque}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {itensVenda.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Itens Adicionados ({itensVenda.length})</h3>
                  <div className="space-y-3">
                    {itensVenda.map((item) => (
                      <div key={item.produto.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                        <div className="flex-1">
                          <div className="font-medium text-[var(--foreground)]">{item.produto.nome}</div>
                          <div className="text-sm text-[var(--foreground)] opacity-70">
                            Unitário: {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}
                            >
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
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <div className="font-semibold text-[var(--chart-green)]">
                              {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removerItem(item.produto.id)} 
                            className="text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                          >
                            <X className="h-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itensVenda.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-[var(--foreground)] opacity-30 mx-auto mb-4" />
                  <p className="text-[var(--foreground)] opacity-70">Nenhum produto adicionado ainda</p>
                  <p className="text-sm text-[var(--foreground)] opacity-50 mt-1">Use a busca acima para adicionar produtos</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Forma de Pagamento</h2>
              <p className="text-[var(--foreground)] opacity-70">Escolha como o cliente irá pagar</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((fp) => (
                    <label key={fp} className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-[var(--muted)] transition-colors border border-[var(--border)] hover:border-[var(--brand)]">
                      <div className="relative">
                        <input
                          type="radio"
                          name="formaPagamento"
                          className="sr-only"
                          checked={formaPagamento === fp}
                          onChange={() => setFormaPagamento(fp)}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          formaPagamento === fp 
                            ? 'border-[var(--brand)] bg-[var(--brand)]' 
                            : 'border-[var(--border)] bg-transparent'
                        }`}>
                          {formaPagamento === fp && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{fp}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Canal de Venda</h3>
                <div className="grid grid-cols-1 gap-4">
                  {salesChannels.map((canal) => (
                    <label key={canal} className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-[var(--muted)] transition-colors border border-[var(--border)] hover:border-[var(--chart-green)]">
                      <div className="relative">
                        <input
                          type="radio"
                          name="canalVenda"
                          className="sr-only"
                          checked={canalVenda === canal}
                          onChange={() => setCanalVenda(canal)}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          canalVenda === canal 
                            ? 'border-[var(--chart-green)] bg-[var(--chart-green)]' 
                            : 'border-[var(--border)] bg-transparent'
                        }`}>
                          {canalVenda === canal && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {canal === 'Local' && <Home className="w-5 h-5 text-[var(--chart-green)]" />}
                        {canal === 'Website' && <Globe className="w-5 h-5 text-[var(--brand)]" />}
                        {canal === 'WhatsApp' && <MessageCircle className="w-5 h-5 text-[var(--accent)]" />}
                        <span className="text-sm font-medium">{canal}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Observações</h3>
                <Input
                  placeholder="Observações adicionais sobre a venda (opcional)"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="bg-[var(--card)] border-[var(--border)] h-12"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-[var(--chart-green)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Resumo da Venda</h2>
              <p className="text-[var(--foreground)] opacity-70">Revise os dados antes de finalizar</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--brand)]" />
                    Cliente
                  </h3>
                  <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-2">
                    <div><strong>Nome:</strong> {cliente}</div>
                    {telefone && <div><strong>Telefone:</strong> {telefone}</div>}
                    {endereco && <div><strong>Endereço:</strong> {endereco}</div>}
                    {cep && <div><strong>CEP:</strong> {cep}</div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--accent)]" />
                    Venda
                  </h3>
                  <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-2">
                    <div><strong>Vendedor:</strong> {vendedor}</div>
                    <div><strong>Data:</strong> {new Date(dataVenda).toLocaleDateString('pt-BR')}</div>
                    <div><strong>Forma de Pagamento:</strong> {formaPagamento}</div>
                    <div><strong>Canal:</strong> {canalVenda}</div>
                    {observacoes && <div><strong>Observações:</strong> {observacoes}</div>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[var(--chart-green)]" />
                  Produtos ({itensVenda.length})
                </h3>
                <div className="space-y-2">
                  {itensVenda.map((item) => (
                    <div key={item.produto.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                      <div>
                        <div className="font-medium">{item.produto.nome}</div>
                        <div className="text-sm text-[var(--foreground)] opacity-70">
                          {item.quantidade}x {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                      <div className="font-semibold text-[var(--chart-green)]">
                        {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--chart-green)]" />
                  Total
                </h3>
                <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground)] opacity-70">Subtotal</span>
                    <span className="font-semibold">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground)] opacity-70">Desconto</span>
                    <Input
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                      className="h-8 w-32 text-right"
                      placeholder="0,00"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-2xl font-bold text-[var(--chart-green)]">
                    <span>Total:</span>
                    <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
              <Receipt className="w-8 h-8 text-[var(--brand)]" />
              Nova Venda
            </h1>
            <p className="text-[var(--foreground)] opacity-70 mt-2">
              Cadastre uma nova venda de forma rápida e organizada
            </p>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--chart-green)]/10 border border-[var(--chart-green)]/20 rounded-lg text-[var(--chart-green)]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Venda salva com sucesso!</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepIndicator 
            step={1} 
            title="Cliente" 
            isActive={activeStep === 1} 
            isCompleted={activeStep > 1} 
            onClick={() => setActiveStep(1)} 
          />
          <StepIndicator 
            step={2} 
            title="Produtos" 
            isActive={activeStep === 2} 
            isCompleted={activeStep > 2} 
            onClick={() => setActiveStep(2)} 
          />
          <StepIndicator 
            step={3} 
            title="Pagamento" 
            isActive={activeStep === 3} 
            isCompleted={activeStep > 3} 
            onClick={() => setActiveStep(3)} 
          />
          <StepIndicator 
            step={4} 
            title="Finalizar" 
            isActive={activeStep === 4} 
            isCompleted={false} 
            onClick={() => setActiveStep(4)} 
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto">
        <div className="admin-card p-8">
          <StepContent />
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={limparFormulario}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>

            {activeStep < 4 ? (
              <Button
                onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                disabled={
                  (activeStep === 1 && (!cliente.trim() || !vendedor.trim())) ||
                  (activeStep === 2 && itensVenda.length === 0)
                }
                className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={salvarVenda}
                disabled={isLoading || !cliente.trim() || !vendedor.trim() || itensVenda.length === 0}
                className="flex items-center gap-2 bg-[var(--chart-green)] hover:bg-[var(--chart-green)]/90"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Salvando...' : 'Finalizar Venda'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}