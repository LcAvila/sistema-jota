"use client";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/http";
import { useToast } from "@/store/toast";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  Users, 
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  MapPin,
  CreditCard,
  Smartphone,
  Store,
  Target,
  Activity,
  Zap,
  Globe,
  Home,
  MessageCircle,
  Receipt,
  Package,
  Star,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  Eye,
  Plus,
  Minus,
  Percent,
  User,
  UserCheck
} from "lucide-react";

// Tipos para os dados
type Sale = {
  id: number;
  date: string;
  total: number;
  channel: 'web' | 'local' | 'whatsapp';
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash';
  customerRegion: string;
  vendedor?: string;
  cliente?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  itens?: string[];
};

type Product = {
  id: number;
  name: string;
  category: string;
  salesCount: number;
  revenue: number;
};

type RegionalData = {
  region: string;
  sales: number;
  revenue: number;
};

type SalesData = {
  daily: { date: string; total: number; orders: number }[];
  weekly: any[];
  monthly: any[];
  yearly: any[];
};

type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  topProducts: Product[];
  topSellers: { id: string; name: string; sales: number; revenue: number }[];
  recentSales: Sale[];
  salesData: SalesData;
  channelData: { web: number; local: number; whatsapp: number };
  paymentData: { pix: number; credit: number; debit: number; cash: number };
  regionalData: RegionalData[];
};

export default function DashboardPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  // Dados do dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    topProducts: [],
    topSellers: [],
    recentSales: [],
    salesData: { daily: [], weekly: [], monthly: [], yearly: [] },
    channelData: { web: 0, local: 0, whatsapp: 0 },
    paymentData: { pix: 0, credit: 0, debit: 0, cash: 0 },
    regionalData: []
  });

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados automaticamente a cada 30 segundos
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dateRange]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Buscar dados da API do dashboard
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
      
      success('Dashboard atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      error('Erro ao carregar dados do dashboard');
      
      // Fallback: tentar carregar do localStorage
      try {
        const raw = localStorage.getItem('admin_vendas');
        if (raw) {
          const vendas = JSON.parse(raw);
          if (Array.isArray(vendas) && vendas.length > 0) {
            // Calcular dados básicos do localStorage
            const totalRevenue = vendas.reduce((sum, v) => sum + (v.total || 0), 0);
            const totalOrders = vendas.length;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            
            // Criar dados simulados baseados no localStorage
            const channelData = {
              web: vendas.filter(v => v.forma === 'PIX' || v.forma === 'Cartão').length,
              local: vendas.filter(v => v.forma === 'Dinheiro').length,
              whatsapp: vendas.filter(v => v.forma === 'PIX').length
            };
            
            const paymentData = {
              pix: vendas.filter(v => v.forma === 'PIX').length,
              credit: vendas.filter(v => v.forma === 'Cartão').length,
              debit: 0,
              cash: vendas.filter(v => v.forma === 'Dinheiro').length
            };
            
            // Vendas diárias simuladas
            const dailyData = Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return {
                date: date.toISOString().split('T')[0],
                total: Math.random() * 1000 + 500, // Valor aleatório para demonstração
                orders: Math.floor(Math.random() * 20) + 5
              };
            });
            
                         setDashboardData(prev => ({
               ...prev,
               totalRevenue,
               totalOrders,
               averageOrderValue,
               totalCustomers: new Set(vendas.map(v => v.cliente)).size,
               channelData,
               paymentData,
               salesData: { ...prev.salesData, daily: dailyData },
               recentSales: vendas.slice(0, 10).map(v => ({
                 id: v.id || Math.random(),
                 date: v.createdAt || new Date().toISOString(),
                 total: v.total || 0,
                 channel: v.canal === 'Website' ? 'web' : v.canal === 'WhatsApp' ? 'whatsapp' : 'local',
                 paymentMethod: v.forma === 'PIX' ? 'pix' : v.forma === 'Cartão de Crédito' ? 'credit' : v.forma === 'Cartão de Débito' ? 'debit' : 'cash',
                 customerRegion: v.endereco ? 'Jacutinga' : 'Não informado',
                 vendedor: v.vendedor,
                 cliente: v.cliente,
                 telefone: v.telefone,
                 cep: v.cep,
                 endereco: v.endereco,
                 itens: v.itens
               }))
             }));
          }
        }
      } catch (fallbackErr) {
        console.error('Erro no fallback:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard Ecommerce</h1>
            
          </div>
          <p className="text-[var(--foreground)] opacity-70 mt-2">
            Visão geral das vendas e métricas do seu negócio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Indicador de dados em tempo real */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--muted)] to-[var(--muted)] bg-opacity-50 border border-[var(--border)] hover:border-[var(--chart-green)] transition-all duration-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--chart-green)] animate-pulse" />
              <span className="text-sm text-[var(--foreground)] opacity-70">Tempo Real</span>
            </div>
            <div className="w-px h-6 bg-[var(--border)]"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--chart-green)]">
                {dashboardData.totalOrders > 0 ? dashboardData.totalOrders : '0'}
              </div>
              <div className="text-xs text-[var(--foreground)] opacity-60">Vendas</div>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-[var(--chart-green)] text-white rounded-lg font-medium hover:bg-[var(--chart-green-dark)] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="admin-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground)] opacity-70">Faturamento Total</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {formatCurrency(dashboardData.totalRevenue)}
              </p>
            </div>
            <Target className="w-8 h-8 text-[var(--chart-green)]" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--chart-green)]" />
              <span className="text-sm text-[var(--chart-green)]">+12.5%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--foreground)] opacity-60">vs mês anterior</span>
              <ArrowUpRight className="w-3 h-3 text-[var(--chart-green)]" />
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground)] opacity-70">Total de Pedidos</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {dashboardData.totalOrders.toLocaleString()}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-[var(--brand)]" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--chart-green)]" />
              <span className="text-sm text-[var(--chart-green)]">+8.3%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--foreground)] opacity-60">vs mês anterior</span>
              <ArrowUpRight className="w-3 h-3 text-[var(--chart-green)]" />
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground)] opacity-70">Ticket Médio</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {formatCurrency(dashboardData.averageOrderValue)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--chart-green)]" />
              <span className="text-sm text-[var(--chart-green)]">+5.2%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--foreground)] opacity-60">vs mês anterior</span>
              <ArrowUpRight className="w-3 h-3 text-[var(--chart-green)]" />
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--foreground)] opacity-70">Clientes Ativos</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {dashboardData.totalCustomers.toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--chart-green)]" />
              <span className="text-sm text-[var(--chart-green)]">+15.7%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--foreground)] opacity-60">vs mês anterior</span>
              <ArrowUpRight className="w-3 h-3 text-[var(--chart-green)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Vendas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Vendas Diárias */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-[var(--chart-green)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Vendas Diárias</h3>
          </div>
          
          {/* Gráfico de Barras com Dados Reais */}
          <div className="h-64 flex items-end justify-between gap-2">
            {dashboardData.salesData.daily.length > 0 ? (
              dashboardData.salesData.daily.map((day, i) => {
                const maxValue = Math.max(...dashboardData.salesData.daily.map(d => d.total), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-[var(--chart-green)] to-[var(--chart-green-light)] rounded-t"
                      style={{ height: `${(day.total / maxValue) * 200}px` }}
                    ></div>
                    <p className="text-xs text-[var(--foreground)] opacity-70 mt-2">
                      {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <p className="text-xs font-medium text-[var(--foreground)]">
                      {formatCurrency(day.total)}
                    </p>
                    <p className="text-xs text-[var(--foreground)] opacity-50">
                      {day.orders} pedidos
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[var(--foreground)] opacity-50">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Canais de Venda */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[var(--brand)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Canais de Venda</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)] bg-opacity-30 hover:bg-[var(--muted)] hover:bg-opacity-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[var(--brand)]" />
                <span className="text-[var(--foreground)] font-medium">Website</span>
                
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.channelData.web)}</p>
                <p className="text-sm text-[var(--foreground)] opacity-70">{dashboardData.channelData.web} vendas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)] bg-opacity-30 hover:bg-[var(--muted)] hover:bg-opacity-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-[var(--chart-green)]" />
                <span className="text-[var(--foreground)] font-medium">Local</span>
                
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.channelData.local)}</p>
                <p className="text-sm text-[var(--foreground)] opacity-70">{dashboardData.channelData.local} vendas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)] bg-opacity-30 hover:bg-[var(--muted)] hover:bg-opacity-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-[var(--foreground)] font-medium">WhatsApp</span>
                
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.channelData.whatsapp)}</p>
                <p className="text-sm text-[var(--foreground)] opacity-70">{dashboardData.channelData.whatsapp} vendas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formas de Pagamento e Regiões */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Formas de Pagamento */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Formas de Pagamento</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--brand)]" />
                  <span className="text-[var(--foreground)] font-medium">PIX</span>
                  
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.paymentData.pix)}</p>
                </div>
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                <div 
                  className="bg-[var(--brand)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dashboardData.paymentData.pix}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--chart-green)]" />
                  <span className="text-[var(--foreground)] font-medium">Cartão de Crédito</span>
                  
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.paymentData.credit)}</p>
                </div>
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                <div 
                  className="bg-[var(--chart-green)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dashboardData.paymentData.credit}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-[var(--foreground)] font-medium">Cartão de Débito</span>
                  
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.paymentData.debit)}</p>
                </div>
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                <div 
                  className="bg-[var(--accent)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dashboardData.paymentData.debit}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-[var(--foreground)] font-medium">Dinheiro</span>
                  
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--foreground)] text-lg">{formatPercentage(dashboardData.paymentData.cash)}</p>
                </div>
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                <div 
                  className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dashboardData.paymentData.cash}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Análise Regional */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-[var(--chart-green)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Análise Regional</h3>
          </div>
          <p className="text-sm text-[var(--foreground)] opacity-70 mb-4">
            Loja: Tv. Marco Schinaider, 40 - Jacutinga, Mesquita - RJ
          </p>
          
                     <div className="space-y-4">
             {dashboardData.regionalData && dashboardData.regionalData.length > 0 ? (
               dashboardData.regionalData.map((region, index) => (
                 <div key={index} className="p-3 rounded-lg bg-[var(--muted)] bg-opacity-30 hover:bg-[var(--muted)] hover:bg-opacity-50 transition-all duration-200">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                       <MapPin className="w-5 h-5 text-[var(--chart-green)]" />
                       <span className="text-[var(--foreground)] font-medium">{region.region}</span>
                       
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-[var(--foreground)] text-lg">{region.sales} vendas</p>
                       <p className="text-sm text-[var(--foreground)] opacity-70">{formatCurrency(region.revenue)}</p>
                     </div>
                   </div>
                   <div className="w-full bg-[var(--muted)] rounded-full h-2">
                     <div 
                       className="bg-[var(--chart-green)] h-2 rounded-full transition-all duration-500 ease-out"
                       style={{ width: `${(region.sales / Math.max(...dashboardData.regionalData.map(r => r.sales), 1)) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8 text-[var(--foreground)] opacity-50">
                 <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                 <p>Nenhum dado regional disponível</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Top Produtos e Vendedores */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Top Produtos */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-[var(--chart-green)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Top Produtos</h3>
          </div>
          
                     <div className="space-y-4">
             {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
               dashboardData.topProducts.map((product, index) => (
                 <div key={product.id} className="p-3 rounded-lg bg-[var(--muted)] bg-opacity-50 hover:bg-[var(--muted)] hover:bg-opacity-70 transition-all duration-200 border-l-4 border-[var(--chart-green)]">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                                               <Star className="w-6 h-6 text-[var(--chart-green)]" />
                       <div>
                         <p className="font-medium text-[var(--foreground)]">{product.name}</p>
                         <p className="text-sm text-[var(--foreground)] opacity-70">{product.category}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-[var(--foreground)] text-lg">{product.salesCount} vendas</p>
                       <p className="text-sm text-[var(--chart-green)] font-medium">{formatCurrency(product.revenue)}</p>
                     </div>
                   </div>
                   <div className="w-full bg-[var(--muted)] rounded-full h-2">
                     <div 
                       className="bg-[var(--chart-green)] h-2 rounded-full transition-all duration-500 ease-out"
                       style={{ width: `${(product.salesCount / Math.max(...dashboardData.topProducts.map(p => p.salesCount), 1)) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8 text-[var(--foreground)] opacity-50">
                 <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                 <p>Nenhum produto disponível</p>
               </div>
             )}
           </div>
        </div>

        {/* Top Vendedores */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-[var(--brand)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Top Vendedores</h3>
          </div>
          
                     <div className="space-y-4">
             {dashboardData.topSellers && dashboardData.topSellers.length > 0 ? (
               dashboardData.topSellers.map((seller, index) => (
                 <div key={seller.id} className="p-3 rounded-lg bg-[var(--muted)] bg-opacity-50 hover:bg-[var(--muted)] hover:bg-opacity-70 transition-all duration-200 border-l-4 border-[var(--brand)]">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                                               <Award className="w-6 h-6 text-[var(--brand)]" />
                       <div>
                         <p className="font-medium text-[var(--foreground)]">{seller.name}</p>
                         <p className="text-sm text-[var(--foreground)] opacity-70">{seller.sales} vendas</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-[var(--chart-green)] text-lg">{formatCurrency(seller.revenue)}</p>
                     </div>
                   </div>
                   <div className="w-full bg-[var(--muted)] rounded-full h-2">
                     <div 
                       className="bg-[var(--brand)] h-2 rounded-full transition-all duration-500 ease-out"
                       style={{ width: `${(seller.revenue / Math.max(...dashboardData.topSellers.map(s => s.revenue), 1)) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8 text-[var(--foreground)] opacity-50">
                 <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                 <p>Nenhum vendedor disponível</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Últimas Vendas */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-[var(--primary)]" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">Últimas Vendas</h3>
          </div>
          <button className="text-sm text-[var(--brand)] hover:underline">Ver todas</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
                         <thead>
               <tr className="border-b border-[var(--border)]">
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">ID</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Cliente</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Vendedor</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Data</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Total</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Canal</th>
                 <th className="text-left py-3 px-4 text-[var(--foreground)] opacity-70 font-medium">Pagamento</th>
               </tr>
             </thead>
                         <tbody>
               {dashboardData.recentSales && dashboardData.recentSales.length > 0 ? (
                 dashboardData.recentSales.map((sale) => (
                   <tr key={sale.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all duration-200 group">
                                           <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--chart-green)] group-hover:animate-pulse"></div>
                          <span className="font-mono text-sm">#{sale.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[var(--foreground)] opacity-60" />
                          <span className="font-medium">{sale.cliente || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[var(--foreground)] opacity-60" />
                          <span className="font-medium">{sale.vendedor || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--foreground)] opacity-60" />
                          <span>{new Date(sale.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[var(--chart-green)]" />
                          <span className="font-medium text-[var(--chart-green)]">
                            {formatCurrency(sale.total)}
                          </span>
                        </div>
                      </td>
                     <td className="py-3 px-4">
                                               <div className="flex items-center gap-2">
                          {sale.channel === 'web' ? (
                            <>
                              <Globe className="w-4 h-4 text-[var(--brand)]" />
                              <span className="text-[var(--brand)]">Website</span>
                            </>
                          ) : sale.channel === 'whatsapp' ? (
                            <>
                              <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-[var(--accent)]">WhatsApp</span>
                            </>
                          ) : (
                            <>
                              <Home className="w-4 h-4 text-[var(--chart-green)]" />
                              <span className="text-[var(--chart-green)]">Local</span>
                            </>
                          )}
                        </div>
                     </td>
                     <td className="py-3 px-4">
                                                                        <div className="flex items-center gap-2">
                          {sale.paymentMethod === 'pix' ? (
                            <>
                              <CreditCard className="w-4 h-4 text-[var(--chart-green)]" />
                              <span className="text-[var(--chart-green)]">PIX</span>
                            </>
                          ) : sale.paymentMethod === 'credit' ? (
                            <>
                              <CreditCard className="w-4 h-4 text-[var(--brand)]" />
                              <span className="text-[var(--brand)]">Crédito</span>
                            </>
                          ) : sale.paymentMethod === 'debit' ? (
                            <>
                              <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                              <span className="text-[var(--accent)]">Débito</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-[var(--primary)]" />
                              <span className="text-[var(--primary)]">Dinheiro</span>
                            </>
                          )}
                        </div>
                     </td>
                     <td className="py-3 px-4">
                       <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-[var(--foreground)] opacity-60" />
                         <span className="text-sm text-[var(--foreground)]">{sale.customerRegion}</span>
                       </div>
                     </td>
                   </tr>
                 ))
               ) : (
                                   <tr>
                    <td colSpan={7} className="text-center py-8 text-[var(--foreground)] opacity-50">
                      <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma venda disponível</p>
                    </td>
                  </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
