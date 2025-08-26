"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, User, CreditCard, RefreshCw, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: number | string;
  name: string;
}

interface DashboardFiltersProps {
  filters: {
    from: string
    to: string
    seller: string
    channel: string
    paymentMethod: string
  }
  vendedores: FilterOption[]
  formasPagamento: FilterOption[]
  canais: FilterOption[]
  onFiltersChange: (filters: any) => void
  onRefresh: () => void
  loading: boolean
}

export function DashboardFilters({ 
  filters, 
  vendedores, 
  formasPagamento, 
  canais,
  onFiltersChange, 
  onRefresh, 
  loading 
}: DashboardFiltersProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Data Inicial
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.from && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {filters.from ? format(new Date(filters.from), "PPP") : <span>Selecione</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.from ? new Date(filters.from) : undefined}
                  onSelect={(date: Date | undefined) => onFiltersChange({...filters, from: date ? format(date, 'yyyy-MM-dd') : ''})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Data Final
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.to && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {filters.to ? format(new Date(filters.to), "PPP") : <span>Selecione</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.to ? new Date(filters.to) : undefined}
                  onSelect={(date: Date | undefined) => onFiltersChange({...filters, to: date ? format(date, 'yyyy-MM-dd') : ''})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Vendedor
            </label>
            <Select value={filters.seller} onValueChange={(value) => onFiltersChange({...filters, seller: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Canal
            </label>
            <Select value={filters.channel} onValueChange={(value) => onFiltersChange({...filters, channel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {canais.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </label>
            <Select value={filters.paymentMethod} onValueChange={(value) => onFiltersChange({...filters, paymentMethod: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={onRefresh}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
