"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any

interface MapChartProps {
  data: Array<{ region: string; value: number }>
  title: string
}

// Este componente simula um mapa por região (ex: estados do Brasil) usando barras horizontais
export function MapChart({ data, title }: MapChartProps) {
  const chartOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '60%'
      }
    },
    xaxis: {
      categories: data.map(item => item.region),
      labels: {
        style: {
          colors: 'var(--muted-foreground)'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--muted-foreground)'
        }
      }
    },
    theme: {
      mode: 'light', // será sobrescrito pelo tema do app
    },
    colors: ['#10b981'],
    dataLabels: {
      enabled: true,
      style: { colors: ['var(--foreground)'] }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    }
  }
  const series = [{ data: data.map(item => item.value) }]

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
