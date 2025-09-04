"use client";
import React, { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";
import { Package, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Search, Filter } from "lucide-react";

type Produto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria?: string;
  ativo: boolean;
  image?: string;
  code?: string;
};

export default function EstoquePage() {
  const { success, error } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar produtos do banco automaticamente
  useEffect(() => {
    loadFromBackend().catch(() => {});
  }, []);

  const categorias = useMemo(() => {
    return Array.from(new Set(produtos.map((p) => p.categoria || ""))).filter(Boolean);
  }, [produtos]);

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      const txt = filtro.trim().toLowerCase();
      const okTxt = !txt || [p.nome, p.categoria].filter(Boolean).some((v) => String(v).toLowerCase().includes(txt));
      const okCat = !categoriaFiltro || (p.categoria || "") === categoriaFiltro;
      return okTxt && okCat;
    });
  }, [produtos, filtro, categoriaFiltro]);

  // Carregar produtos do banco
  async function loadFromBackend() {
    try {
      setLoading(true);
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
      success(`Carregados ${list.length} produtos do banco`);
    } catch (e: any) {
      error(e?.message || 'Erro ao carregar produtos do banco');
      // Fallback: carregar do localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }

  // Carregar produtos do localStorage como fallback
  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('admin_produtos');
      if (raw) {
        const list: Produto[] = JSON.parse(raw);
        setProdutos(list);
        success(`Carregados ${list.length} produtos do dispositivo`);
      }
    } catch (e) {
      error('Erro ao carregar produtos do dispositivo');
    }
  }

  // Cadastrar produtos padrão do sistema
  function cadastrarProdutosPadrao() {
    try {
      const produtosPadrao: Produto[] = [
        // Temperos e Condimentos
        { id: 1, nome: "Alho Descascado 1kg", preco: 15.90, estoque: 50, categoria: "Temperos", ativo: true, image: "/assets/produtos/alho descascado 1kl.heic", code: "TEMP001" },
        { id: 2, nome: "Alho Frito Granulado", preco: 12.50, estoque: 30, categoria: "Temperos", ativo: true, image: "/assets/produtos/alho frito granulado.webp", code: "TEMP002" },
        { id: 3, nome: "Azeite Extra Virgem", preco: 19.90, estoque: 25, categoria: "Temperos", ativo: true, image: "/assets/produtos/azeite extra virgem.jpg", code: "TEMP003" },
        { id: 4, nome: "Ajinomoto Realçador de Sabor", preco: 8.90, estoque: 40, categoria: "Temperos", ativo: true, image: "/assets/produtos/ajinomono.heic", code: "TEMP004" },
        { id: 5, nome: "Açafrão em Pó", preco: 12.90, estoque: 35, categoria: "Temperos", ativo: true, image: "/assets/produtos/açafrão.heic", code: "TEMP005" },
        { id: 6, nome: "Colorau Premium", preco: 6.90, estoque: 45, categoria: "Temperos", ativo: true, image: "/assets/produtos/colorau.heic", code: "TEMP006" },
        { id: 7, nome: "Cominho Moído", preco: 9.50, estoque: 38, categoria: "Temperos", ativo: true, image: "/assets/produtos/cominho moído.heic", code: "TEMP007" },
        { id: 8, nome: "Lemon Pepper", preco: 7.90, estoque: 42, categoria: "Temperos", ativo: true, image: "/assets/produtos/lemon pepper.heic", code: "TEMP008" },
        { id: 9, nome: "Pimenta do Reino Moída 1kg", preco: 12.90, estoque: 28, categoria: "Temperos", ativo: true, image: "/assets/produtos/pimenta do reino moído 1kl.heic", code: "TEMP009" },
        { id: 10, nome: "Tempero do Chef", preco: 8.50, estoque: 33, categoria: "Temperos", ativo: true, image: "/assets/produtos/tempero do chef.heic", code: "TEMP010" },

        // Conservas
        { id: 11, nome: "Azeitona Verde Especial", preco: 7.80, estoque: 60, categoria: "Conservas", ativo: true, image: "/assets/produtos/azeitona verde.heic", code: "CONS001" },
        { id: 12, nome: "Alcaparras Importadas", preco: 18.90, estoque: 20, categoria: "Conservas", ativo: true, image: "/assets/produtos/alcaparras.heic", code: "CONS002" },
        { id: 13, nome: "Pimenta Biquinho", preco: 11.50, estoque: 35, categoria: "Conservas", ativo: true, image: "/assets/produtos/pimenta biquinho.heic", code: "CONS003" },
        { id: 14, nome: "Cogumelo Fatiado", preco: 13.90, estoque: 30, categoria: "Conservas", ativo: true, image: "/assets/produtos/cogumelo fatiado.heic", code: "CONS004" },

        // Carnes
        { id: 15, nome: "Carne Seca 5kg", preco: 89.90, estoque: 15, categoria: "Carnes", ativo: true, image: "/assets/produtos/carne seca 5kl.heic", code: "CARN001" },
        { id: 16, nome: "Linguiça Calabresa 5kg", preco: 45.90, estoque: 25, categoria: "Carnes", ativo: true, image: "/assets/produtos/linguiça calabresa 5kl.heic", code: "CARN002" },
        { id: 17, nome: "Linguiça Mineira", preco: 28.90, estoque: 30, categoria: "Carnes", ativo: true, image: "/assets/produtos/linguiça mineira.heic", code: "CARN003" },
        { id: 18, nome: "Linguiça Suína Artesanal", preco: 32.50, estoque: 22, categoria: "Carnes", ativo: true, image: "/assets/produtos/linguiça suina.heic", code: "CARN004" },

        // Massas
        { id: 19, nome: "Massa de Lasanha 2kg", preco: 16.90, estoque: 40, categoria: "Massas", ativo: true, image: "/assets/produtos/lasanha 2kl.heic", code: "MASS001" },
        { id: 20, nome: "Nhoque Artesanal 1kg", preco: 12.90, estoque: 35, categoria: "Massas", ativo: true, image: "/assets/produtos/nhoque 1kl.heic", code: "MASS002" },
        { id: 21, nome: "Massa de Pastel Disco", preco: 8.90, estoque: 50, categoria: "Massas", ativo: true, image: "/assets/produtos/massa de pastel disco.heic", code: "MASS003" },
        { id: 22, nome: "Massa de Lasanha", preco: 14.90, estoque: 45, categoria: "Massas", ativo: true, image: "/assets/produtos/massa de lasanha.webp", code: "MASS004" },
        { id: 23, nome: "Massa de Nhoque", preco: 11.90, estoque: 38, categoria: "Massas", ativo: true, image: "/assets/produtos/massa de nhoque.webp", code: "MASS005" },
        { id: 24, nome: "Massa de Pastel", preco: 7.90, estoque: 55, categoria: "Massas", ativo: true, image: "/assets/produtos/massa de pastel.webp", code: "MASS006" },

        // Farinhas
        { id: 25, nome: "Farinha de Rosca 10kg", preco: 35.90, estoque: 20, categoria: "Farinhas", ativo: true, image: "/assets/produtos/farinha de rosca 10kl.heic", code: "FARI001" },
        { id: 26, nome: "Farinha de Rosca", preco: 8.90, estoque: 45, categoria: "Farinhas", ativo: true, image: "/assets/produtos/farinha de rosca.webp", code: "FARI002" },

        // Vegetais
        { id: 27, nome: "Aipim Descascado 10kg", preco: 25.90, estoque: 30, categoria: "Vegetais", ativo: true, image: "/assets/produtos/aipim descascado 10kl.heic", code: "VEGE001" },
        { id: 28, nome: "Alho Descascado 1kg", preco: 18.90, estoque: 40, categoria: "Vegetais", ativo: true, image: "/assets/produtos/alho descascado 1kl.heic", code: "VEGE002" },
        { id: 29, nome: "Alho Descascado Premium", preco: 12.90, estoque: 35, categoria: "Vegetais", ativo: true, image: "/assets/produtos/alho descascado.png", code: "VEGE003" },
        { id: 30, nome: "Alho Frito 1kg", preco: 22.90, estoque: 25, categoria: "Vegetais", ativo: true, image: "/assets/produtos/alho frito 1kl.heic", code: "VEGE004" },

        // Ovos
        { id: 31, nome: "Ovos de Codorna 700g", preco: 15.90, estoque: 60, categoria: "Ovos", ativo: true, image: "/assets/produtos/ovo de codorna 700g.heic", code: "OVOS001" },
        { id: 32, nome: "Ovos de Codorna", preco: 13.90, estoque: 55, categoria: "Ovos", ativo: true, image: "/assets/produtos/ovos de codorna.webp", code: "OVOS002" },

        // Caldos
        { id: 33, nome: "Caldo de Galinha Concentrado", preco: 4.90, estoque: 80, categoria: "Caldos", ativo: true, image: "/assets/produtos/caldo de galinha.heic", code: "CALD001" },

        // Ingredientes
        { id: 34, nome: "Bicarbonato de Sódio", preco: 3.90, estoque: 70, categoria: "Ingredientes", ativo: true, image: "/assets/produtos/bicarbonato de sódio.heic", code: "INGR001" },
        { id: 35, nome: "Uvas Passas", preco: 8.90, estoque: 45, categoria: "Ingredientes", ativo: true, image: "/assets/produtos/uvas passas.heic", code: "INGR002" },

        // Pratos Prontos
        { id: 36, nome: "Bolinho de Bacalhau", preco: 19.90, estoque: 25, categoria: "Pratos Prontos", ativo: true, image: "/assets/produtos/bolinho de bacalhau.webp", code: "PRAT001" },
        { id: 37, nome: "Carne Seca Premium", preco: 65.90, estoque: 18, categoria: "Pratos Prontos", ativo: true, image: "/assets/produtos/carne seca.webp", code: "PRAT002" }
      ];

      // Salvar no localStorage
      localStorage.setItem('admin_produtos', JSON.stringify(produtosPadrao));
      
      // Atualizar estado
      setProdutos(produtosPadrao);
      
      success(`✅ ${produtosPadrao.length} produtos cadastrados com sucesso!`);
    } catch (e) {
      error('Erro ao cadastrar produtos padrão');
    }
  }

  // Atualizar estoque de um produto
  async function updateStock(id: number, newStock: number) {
    try {
      const resp = await apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: newStock }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || `Falha ao atualizar (${resp.status})`);
      }
      success('Estoque atualizado');
      await loadFromBackend();
    } catch (e: any) {
      error(e?.message || 'Erro ao atualizar estoque');
    }
  }

  // Estatísticas do estoque
  const stats = useMemo(() => {
    const total = produtos.length;
    const ativos = produtos.filter(p => p.ativo).length;
    const semEstoque = produtos.filter(p => p.estoque === 0).length;
    const baixoEstoque = produtos.filter(p => p.estoque > 0 && p.estoque <= 10).length;
    const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque, 0);
    const valorTotal = produtos.reduce((sum, p) => sum + (p.preco * p.estoque), 0);

    return {
      total,
      ativos,
      semEstoque,
      baixoEstoque,
      totalEstoque,
      valorTotal
    };
  }, [produtos]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Controle de Estoque</h1>
            <p className="text-[var(--foreground)] opacity-70 mt-2">
              Gerencie o estoque de seus produtos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cadastrarProdutosPadrao}
              className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand)] hover:bg-opacity-80 transition-colors flex items-center gap-2"
              title="Cadastrar todos os produtos padrão do sistema"
            >
              <Package className="w-4 h-4" />
              Cadastrar Produtos Padrão
            </button>
            <button
              onClick={() => loadFromBackend()}
              className="px-4 py-2 bg-[var(--chart-green)] text-white rounded-lg font-medium hover:bg-[var(--chart-green-dark)] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--chart-green)] rounded-lg mx-auto mb-3">
            <Package className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Total de Produtos</p>
        </div>

        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--chart-green)] rounded-lg mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.ativos}</p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Produtos Ativos</p>
        </div>

        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--chart-green)] rounded-lg mx-auto mb-3">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.totalEstoque.toLocaleString()}</p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Total em Estoque</p>
        </div>

        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--warning)] rounded-lg mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.semEstoque}</p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Sem Estoque</p>
        </div>

        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--warning)] rounded-lg mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.baixoEstoque}</p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Estoque Baixo</p>
        </div>

        <div className="admin-card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-[var(--chart-green)] rounded-lg mx-auto mb-3">
            <Package className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            R$ {stats.valorTotal.toFixed(2)}
          </p>
          <p className="text-sm text-[var(--foreground)] opacity-70">Valor Total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--foreground)] opacity-50" />
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nome ou categoria..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="">Todas categorias</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button 
              onClick={() => { setFiltro(""); setCategoriaFiltro(""); }} 
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            Produtos em Estoque ({filtrados.length})
          </h3>
          {loading && (
            <div className="flex items-center gap-2 text-[var(--foreground)] opacity-70">
              <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin"></div>
              Carregando...
            </div>
          )}
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--foreground)] opacity-70">
              {loading ? 'Carregando produtos...' : 'Nenhum produto encontrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Produto</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Código</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Categoria</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Preço</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Estoque Atual</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((produto) => (
                  <tr key={produto.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {produto.image ? (
                          <img 
                            src={produto.image} 
                            alt={produto.nome}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-[var(--foreground)] opacity-50" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{produto.nome}</p>
                          <p className="text-sm text-[var(--foreground)] opacity-70">ID: {produto.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-[var(--foreground)]">{produto.code || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[var(--foreground)]">{produto.categoria || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[var(--foreground)]">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        produto.estoque === 0 
                          ? 'text-[var(--error)]' 
                          : produto.estoque <= 10 
                            ? 'text-[var(--warning)]' 
                            : 'text-[var(--chart-green)]'
                      }`}>
                        {produto.estoque.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        produto.estoque === 0 
                          ? 'bg-[var(--error)] text-white' 
                          : produto.estoque <= 10 
                            ? 'bg-[var(--warning)] text-white' 
                            : 'bg-[var(--chart-green)] text-white'
                      }`}>
                        {produto.estoque === 0 
                          ? 'Sem Estoque' 
                          : produto.estoque <= 10 
                            ? 'Baixo' 
                            : 'OK'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={produto.estoque}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            setProdutos(prev => prev.map(p => 
                              p.id === produto.id ? { ...p, estoque: newStock } : p
                            ));
                          }}
                          onBlur={() => updateStock(produto.id, produto.estoque)}
                          className="w-20 px-2 py-1 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-center"
                        />
                        <span className="text-xs text-[var(--foreground)] opacity-70">unid.</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alertas de Estoque */}
      {(stats.semEstoque > 0 || stats.baixoEstoque > 0) && (
        <div className="admin-card p-6 mt-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
            Alertas de Estoque
          </h3>
          
          {stats.semEstoque > 0 && (
            <div className="mb-4 p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
              <p className="text-[var(--error)] font-medium">
                {stats.semEstoque} produto(s) sem estoque
              </p>
              <p className="text-[var(--foreground)] opacity-70 text-sm mt-1">
                Estes produtos precisam de reposição urgente
              </p>
            </div>
          )}

          {stats.baixoEstoque > 0 && (
            <div className="p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
              <p className="text-[var(--warning)] font-medium">
                {stats.baixoEstoque} produto(s) com estoque baixo (≤10 unidades)
              </p>
              <p className="text-[var(--foreground)] opacity-70 text-sm mt-1">
                Considere fazer reposição em breve
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
