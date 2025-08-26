"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import { TopProducts } from '@/components/dashboard/top-products'
import { PieChart } from '@/components/dashboard/pie-chart'
import { BarChart } from '@/components/dashboard/bar-chart'
import { TopSeller } from '@/components/dashboard/top-seller'
import { DollarSign, ShoppingCart, TrendingUp, Ban, Users, Package, Calendar, Clock, Star, Target, Activity, CreditCard } from 'lucide-react'

// Interfaces
interface Filters {
  from: string
  to: string
  seller: string
  paymentMethod: string
  channel: string
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  canceledOrders: number;
  topProducts: { key: string; value: number }[];
  paymentMethodData: { key: string; value: number }[];
  sellerRankingData: { key: string; value: number }[];
  recentSales: any[];
  salesChart: { name: string; value: number }[];
  salesChannelData: { key: string; value: number }[];
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<Filters>({
    from: '',
    to: '',
    seller: '',
    paymentMethod: '',
    channel: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.seller) params.append('sellerId', filters.seller);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

    try {
      const response = await fetch(`http://localhost:4000/api/sales/dashboard?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result: DashboardData = await response.json();
      
      // Garantir que todos os arrays existam, mesmo que vazios
      const safeData: DashboardData = {
        totalRevenue: result.totalRevenue || 0,
        totalOrders: result.totalOrders || 0,
        averageTicket: result.averageTicket || 0,
        canceledOrders: result.canceledOrders || 0,
        topProducts: Array.isArray(result.topProducts) ? result.topProducts : [],
        paymentMethodData: Array.isArray(result.paymentMethodData) ? result.paymentMethodData : [],
        sellerRankingData: Array.isArray(result.sellerRankingData) ? result.sellerRankingData : [],
        recentSales: Array.isArray(result.recentSales) ? result.recentSales : [],
        salesChart: Array.isArray(result.salesChart) ? result.salesChart : [],
        salesChannelData: Array.isArray(result.salesChannelData) ? result.salesChannelData : []
      };
      
      setData(safeData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Definir dados padrão em caso de erro
      setData({
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0,
        canceledOrders: 0,
        topProducts: [],
        paymentMethodData: [],
        sellerRankingData: [],
        recentSales: [],
        salesChart: [],
        salesChannelData: []
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { 
    totalRevenue = 0, 
    totalOrders = 0, 
    averageTicket = 0, 
    canceledOrders = 0,
    topProducts = [],
    paymentMethodData = [],
    sellerRankingData = [],
    recentSales = [],
    salesChart = [],
    salesChannelData = []
  } = data || {};

  const kpis = [
    {
      title: 'Faturamento Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue),
      change: '+12.5%', // Simulado
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Total de Pedidos',
      value: totalOrders.toString(),
      change: '+8.2%', // Simulado
      trend: 'up' as const,
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      title: 'Ticket Médio',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket),
      change: '+3.1%', // Simulado
      trend: 'up' as const,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Pedidos Cancelados',
      value: canceledOrders.toString(),
      change: `${totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : '0.0'}%`,
      trend: 'down' as const,
      icon: <Ban className="h-4 w-4" />
    }
  ];

  const [filterOptions, setFilterOptions] = useState({
    sellers: [] as { id: number; name: string }[],
    paymentMethods: [] as { id: number; name: string }[],
    channels: [] as { id: string; name: string }[],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/dashboard/filters');
        const options = await response.json();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const onFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dashboard de Vendas
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Visão completa do desempenho do seu negócio
              </p>
            </div>
            <DashboardFilters
              filters={filters}
              vendedores={filterOptions.sellers}
              formasPagamento={filterOptions.paymentMethods}
              canais={filterOptions.channels}
              onFiltersChange={onFiltersChange}
              onRefresh={fetchData}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Faturamento Total</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+12.5%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">vs mês anterior</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total de Pedidos</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalOrders}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-blue-500">+8.2%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">vs mês anterior</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Average Ticket Card */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ticket Médio</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-500">+3.1%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">vs mês anterior</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Canceled Orders Card */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pedidos Cancelados</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{canceledOrders}</p>
              <div className="flex items-center mt-2">
                <Ban className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium text-red-500">
                  {totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : '0.0'}%
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">do total</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
              <Ban className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Sales Evolution Chart */}
        <div className="xl:col-span-2 backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Evolução de Vendas</h3>
            <Activity className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <SalesChart data={salesChart} title="" />
        </div>

        {/* Top Products */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Produtos</h3>
            <Star className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.key} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white truncate">{product.key}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{product.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Top Seller Card */}
        <div className="lg:col-span-1 xl:col-span-2">
          <TopSeller data={sellerRankingData as any} />
        </div>

        {/* Payment Methods */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-4 xl:p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4 xl:mb-6">
            <h3 className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white">Formas de Pagamento</h3>
            <CreditCard className="h-5 w-5 xl:h-6 xl:w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <PieChart
            title=""
            data={paymentMethodData.map(p => ({ label: p.key, value: p.value }))}
          />
        </div>

        {/* Sales Channels */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-4 xl:p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4 xl:mb-6">
            <h3 className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white">Canais de Venda</h3>
            <Package className="h-5 w-5 xl:h-6 xl:w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <BarChart
            title=""
            data={salesChannelData.map(c => ({ label: c.key, value: c.value }))}
          />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Últimos Pedidos</h3>
          <Clock className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <RecentSales data={recentSales} />
      </div>
    </div>
  )
}

export default DashboardPage
