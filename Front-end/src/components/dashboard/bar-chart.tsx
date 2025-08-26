"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any

interface BarChartProps {
  data: Array<{ label: string; value: number }>
  title: string
  color?: string
}

export function BarChart({ data, title, color = '#3b82f6' }: BarChartProps) {
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
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false }
    },
    xaxis: {
      categories: data.map(item => item?.label || 'N/A'),
      labels: {
        style: {
          colors: ['hsl(var(--muted-foreground))']
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: ['hsl(var(--muted-foreground))']
        }
      }
    },
    theme: {
      mode: 'light',
    },
    colors: [color],
    dataLabels: {
      enabled: true,
      style: { 
        colors: ['hsl(var(--foreground))'],
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 3
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: 'top'
        }
      }
    }
  }
  const series = [{ data: data.map(item => item?.value || 0) }]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Chart options={chartOptions} series={series} type="bar" height="100%" />
        </div>
      </CardContent>
    </Card>
  )
}
