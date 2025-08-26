"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  key: string
  total: number
  pedidos: number
}

interface TopProductsProps {
  products: Product[]
}

export function TopProducts({ products }: TopProductsProps) {
  const maxValue = Math.max(...products.map(item => item.total))

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground">Top Produtos</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {products.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{item.key}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.pedidos} pedidos
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(item.total)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.total / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
