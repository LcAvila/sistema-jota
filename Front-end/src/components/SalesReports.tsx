"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  Filter,
  Eye
} from 'lucide-react';

interface SalesReport {
  summary: {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
  };
  salesByPeriod: Array<{
    id: number;
    total: number;
    createdAt: string;
    seller: { name: string };
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalQuantity: number;
    totalSales: number;
    revenue: number;
  }>;
  topSellers: Array<{
    sellerId: number;
    sellerName: string;
    totalRevenue: number;
    totalSales: number;
  }>;
}

interface Sale {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  client: { name: string; email: string };
  seller: { name: string };
  items: Array<{
    qty: number;
    unitPrice: number;
    product: { name: string; sku: string };
  }>;
  orderPayments: Array<{
    amount: number;
    paymentMethod: { name: string };
  }>;
}

export default function SalesReports() {
  const [reportData, setReportData] = useState<SalesReport | null>(null);
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  
  // Filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sellerId: '',
    period: '30'
  });

  const [sellers, setSellers] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    loadSellers();
    loadReports();
  }, []);

  const loadSellers = async () => {
    try {
      const response = await fetch('/api/users?role=seller');
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sellerId) queryParams.append('sellerId', filters.sellerId);

      const [reportsResponse, salesResponse] = await Promise.all([
        fetch(`/api/sales/reports?${queryParams.toString()}`),
        fetch(`/api/sales?${queryParams.toString()}&limit=50`)
      ]);

      const [reportsData, salesData] = await Promise.all([
        reportsResponse.json(),
        salesResponse.json()
      ]);

      setReportData(reportsData);
      setSalesList(salesData.sales || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    loadReports();
  };

  const exportToCSV = () => {
    if (!salesList.length) return;

    const csvData = salesList.map(sale => ({
      'ID': sale.id,
      'Data': new Date(sale.createdAt).toLocaleDateString('pt-BR'),
      'Cliente': sale.client.name,
      'Vendedor': sale.seller.name,
      'Total': sale.total,
      'Status': sale.status,
      'Forma de Pagamento': sale.orderPayments.map(p => p.paymentMethod.name).join(', ')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vendedor</label>
              <Select value={filters.sellerId} onValueChange={(value) => setFilters(prev => ({ ...prev, sellerId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os vendedores</SelectItem>
                  {sellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id.toString()}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
              <Button variant="outline" onClick={exportToCSV} disabled={!salesList.length}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="px-6"
        >
          Visão Geral
        </Button>
        <Button
          variant={activeTab === 'detailed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('detailed')}
          className="px-6"
        >
          Vendas Detalhadas
        </Button>
      </div>

      {activeTab === 'overview' && reportData && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.summary.totalSales}
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reportData.summary.averageTicket)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Vendas */}
          <SalesChart
            data={reportData.salesByPeriod.map(sale => ({
              name: new Date(sale.createdAt).toLocaleDateString('pt-BR'),
              value: Number(sale.total)
            }))}
            title="Evolução das Vendas"
            type="area"
          />

          {/* Top Products e Top Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-gray-600">
                            {product.totalQuantity} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-600">{product.totalSales} vendas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topSellers.slice(0, 5).map((seller, index) => (
                    <div key={seller.sellerId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{seller.sellerName}</p>
                          <p className="text-sm text-gray-600">
                            {seller.totalSales} vendas realizadas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(seller.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma venda encontrada para os filtros aplicados
                </div>
              ) : (
                salesList.map((sale) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <Badge variant="outline">#{sale.id}</Badge>
                          <span className="text-sm text-gray-600">
                            {formatDate(sale.createdAt)}
                          </span>
                          <Badge variant={sale.status === 'Concluído' ? 'default' : 'secondary'}>
                            {sale.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Cliente</p>
                            <p className="text-gray-600">{sale.client.name}</p>
                            <p className="text-gray-500 text-xs">{sale.client.email}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">Vendedor</p>
                            <p className="text-gray-600">{sale.seller.name}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">Pagamento</p>
                            <p className="text-gray-600">
                              {sale.orderPayments.map(p => p.paymentMethod.name).join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="font-medium text-sm mb-1">Itens:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {sale.items.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  {item.product.name} x{item.qty}
                                </span>
                                <span>
                                  {formatCurrency(Number(item.unitPrice) * item.qty)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(Number(sale.total))}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
