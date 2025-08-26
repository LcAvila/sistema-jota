"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any

interface PieChartProps {
  data: Array<{ label: string; value: number }>
  title: string
}

export function PieChart({ data, title }: PieChartProps) {
  // Verificar se os dados existem e não estão vazios
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="text-center text-muted-foreground">
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      toolbar: { show: false }
    },
    labels: data.map(item => item?.label || 'N/A'),
    legend: {
      show: true,
      position: 'bottom',
      labels: { colors: 'var(--foreground)' }
    },
    theme: {
      mode: 'light', // será sobrescrito pelo tema do app
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['var(--foreground)'] }
    },
    tooltip: {
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
      }
    },
    colors: ['#3b82f6', '#f59e42', '#10b981', '#ef4444', '#a78bfa', '#f472b6', '#facc15']
  }
  const series = data.map(item => item?.value || 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Chart options={chartOptions} series={series} type="pie" height="100%" />
        </div>
      </CardContent>
    </Card>
  )
}
