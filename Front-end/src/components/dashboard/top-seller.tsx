"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react"

interface TopSellerProps {
  data?: Array<{
    key: string
    value: number
    vendas: number
    ticketMedio: number
  }>
}

export function TopSeller({ data = [] }: TopSellerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const topSeller = data[0]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Top Vendedor
        </CardTitle>
        <Trophy className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        {topSeller ? (
          <div className="space-y-4">
            {/* Vendedor Principal */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white font-bold text-lg">
                  🏆
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">{topSeller.key}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary" className="text-xs">
                      {topSeller.vendas} vendas
                    </Badge>
                    <span>•</span>
                    <span>Ticket: {formatCurrency(topSeller.ticketMedio)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(topSeller.value)}
                </p>
                <p className="text-xs text-gray-500">Total vendido</p>
              </div>
            </div>

            {/* Ranking dos outros vendedores */}
            {data.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Ranking Completo</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.slice(0, 5).map((seller, index) => (
                    <div
                      key={seller.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 
                            ? 'bg-yellow-500 text-white' 
                            : index === 1 
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-400 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{seller.key}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller.vendas} vendas • {formatCurrency(seller.ticketMedio)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm text-green-600">
                          {formatCurrency(seller.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
            <p className="text-xs text-muted-foreground/70">
              Dados aparecerão após as primeiras vendas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
