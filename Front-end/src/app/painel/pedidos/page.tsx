"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/store/session";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Pedido = {
  id: number;
  cliente: string;
  telefone: string;
  endereco: string;
  itens: string[];
  total: number;
  status: 'pendente' | 'separacao' | 'entrega' | 'concluido';
  data: string;
  hora: string;
  vendedor: string;
  forma: string;
  canal: string;
};

export default function PedidosPage() {
  const { session } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = () => {
    try {
      const raw = localStorage.getItem('admin_vendas');
      if (raw) {
        const vendas = JSON.parse(raw);
        const pedidosFormatados: Pedido[] = vendas.map((venda: any, index: number) => ({
          id: venda.id || index + 1,
          cliente: venda.cliente,
          telefone: venda.telefone || 'Não informado',
          endereco: venda.endereco || 'Não informado',
          itens: venda.itens || [],
          total: venda.total || 0,
          status: 'pendente' as const,
          data: venda.data || new Date().toISOString().split('T')[0],
          hora: venda.hora || '00:00',
          vendedor: venda.vendedor || 'Não informado',
          forma: venda.forma || 'Não informado',
          canal: venda.canal || 'Não informado'
        }));
        setPedidos(pedidosFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'separacao': return <Package className="w-4 h-4 text-blue-500" />;
      case 'entrega': return <Truck className="w-4 h-4 text-orange-500" />;
      case 'concluido': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'separacao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entrega': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateStatus = (pedidoId: number, newStatus: Pedido['status']) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId ? { ...pedido, status: newStatus } : pedido
    ));
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.telefone.includes(searchTerm) ||
                         pedido.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "todos" || pedido.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    todos: pedidos.length,
    pendente: pedidos.filter(p => p.status === 'pendente').length,
    separacao: pedidos.filter(p => p.status === 'separacao').length,
    entrega: pedidos.filter(p => p.status === 'entrega').length,
    concluido: pedidos.filter(p => p.status === 'concluido').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-[var(--brand)]" />
            Pedidos
          </h1>
          <p className="text-[var(--foreground)] opacity-70 mt-1">
            Gerencie os pedidos dos clientes
          </p>
        </div>
        <div className="text-sm text-[var(--foreground)] opacity-70">
          Bem-vindo, {session?.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.todos}</div>
              <div className="text-sm text-[var(--foreground)] opacity-70">Total</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.pendente}</div>
              <div className="text-sm text-[var(--foreground)] opacity-70">Pendentes</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.separacao}</div>
              <div className="text-sm text-[var(--foreground)] opacity-70">Separação</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.entrega}</div>
              <div className="text-sm text-[var(--foreground)] opacity-70">Entrega</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{statusCounts.concluido}</div>
              <div className="text-sm text-[var(--foreground)] opacity-70">Concluídos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)] opacity-50" />
          <Input
            placeholder="Buscar por cliente, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[var(--card)] border-[var(--border)]"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'pendente', 'separacao', 'entrega', 'concluido'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'todos' ? 'Todos' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Pedidos List */}
      <div className="space-y-4">
        {filteredPedidos.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-[var(--foreground)] opacity-30 mx-auto mb-4" />
            <p className="text-[var(--foreground)] opacity-70">Nenhum pedido encontrado</p>
            <p className="text-sm text-[var(--foreground)] opacity-50 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Os pedidos aparecerão aqui quando forem criados'}
            </p>
          </div>
        ) : (
          filteredPedidos.map((pedido) => (
            <div key={pedido.id} className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      Pedido #{pedido.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pedido.status)}`}>
                      {getStatusIcon(pedido.status)}
                      <span className="ml-1 capitalize">{pedido.status}</span>
                    </span>
                  </div>
                  <div className="text-sm text-[var(--foreground)] opacity-70">
                    {pedido.data} às {pedido.hora}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--chart-green)]">
                    {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-sm text-[var(--foreground)] opacity-70">
                    {pedido.forma} • {pedido.canal}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-[var(--foreground)] opacity-50" />
                    <span className="font-medium">{pedido.cliente}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-70">
                    <Phone className="w-4 h-4" />
                    <span>{pedido.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-70">
                    <MapPin className="w-4 h-4" />
                    <span>{pedido.endereco}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Vendedor:</span> {pedido.vendedor}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Itens:</span> {pedido.itens.length}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Produtos:</h4>
                <div className="space-y-1">
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="text-sm text-[var(--foreground)] opacity-70 bg-[var(--muted)] px-3 py-1 rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {pedido.status !== 'concluido' && (
                    <>
                      {pedido.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(pedido.id, 'separacao')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Iniciar Separação
                        </Button>
                      )}
                      {pedido.status === 'separacao' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(pedido.id, 'entrega')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Enviar para Entrega
                        </Button>
                      )}
                      {pedido.status === 'entrega' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(pedido.id, 'concluido')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Marcar como Concluído
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <div className="text-xs text-[var(--foreground)] opacity-50">
                  ID: {pedido.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}