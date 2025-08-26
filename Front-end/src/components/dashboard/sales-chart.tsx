"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any

interface SalesChartProps {
  data: Array<{ name: string; value: number }>
  title: string
  type?: "area" | "bar" | "line"
}

export function SalesChart({ data, title, type = "area" }: SalesChartProps) {
  // Verificar se os dados existem e não estão vazios
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-card border-border h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Carregando dados do gráfico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartOptions = {
    chart: {
      id: 'sales-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent'
    },
    theme: {
      mode: 'dark' as const
    },
    xaxis: {
      categories: data.map(item => item?.name || 'N/A'),
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8'
        },
        formatter: (val: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(val || 0)
        }
      }
    },
    colors: ['#3b82f6'],
    stroke: {
      width: 2,
      curve: 'smooth' as const
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.7,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(val || 0)
        }
      }
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3
    }
  }

  const series = [{
    name: 'Faturamento',
    data: data.map(item => item?.value || 0)
  }]

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="h-[350px]">
          <Chart
            options={chartOptions}
            series={series}
            type={type}
            height="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}
