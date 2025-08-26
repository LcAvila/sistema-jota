"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, RefreshCw } from "lucide-react"

interface Sale {
  id: number
  total: number
  createdAt: string
  status: string
  client: {
    name: string
    email: string
  }
  seller: {
    name: string
  }
  orderPayments: Array<{
    amount: number
    paymentMethod: {
      name: string
    }
  }>
}

interface RecentSalesProps {
  data?: Sale[]
  refreshInterval?: number
}

export function RecentSales({ data: externalData, refreshInterval = 30000 }: RecentSalesProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchRecentSales = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sales?limit=10')
      const data = await response.json()
      setSales(data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao buscar vendas recentes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Se dados externos foram fornecidos, use-os
    if (externalData && Array.isArray(externalData)) {
      setSales(externalData)
      setIsLoading(false)
      setLastUpdate(new Date())
    } else {
      // Caso contrário, busque os dados da API
      fetchRecentSales()
      
      // Auto-refresh apenas se não há dados externos
      const interval = setInterval(fetchRecentSales, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [externalData, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "default" as const
      case "Pendente":
        return "secondary" as const
      case "Cancelado":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchRecentSales()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Vendas Recentes</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && sales.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma venda encontrada
            </p>
          ) : (
            sales.map((sale: any) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-foreground truncate">
                      {sale.cliente || 'Cliente não informado'}
                    </span>
                    <Badge variant="default" className="text-xs shrink-0">
                      #{sale.id}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="truncate">Vendedor: {sale.vendedor || 'N/A'}</p>
                    <p className="truncate">
                      Pagamento: {sale.forma || 'N/A'}
                    </p>
                    <p className="text-xs">{sale.data || formatDate(sale.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                  <span className="font-bold text-lg text-green-600">
                    {formatCurrency(Number(sale.total))}
                  </span>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
