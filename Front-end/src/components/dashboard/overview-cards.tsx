"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"

interface KPI {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}

interface OverviewCardsProps {
  kpis: KPI[]
  loading?: boolean
}

export function OverviewCards({ kpis, loading }: OverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {kpi.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge 
                variant={kpi.trend === "up" ? "default" : "destructive"}
                className="text-xs"
              >
                {kpi.change}
              </Badge>
              <span>em relação ao mês anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
