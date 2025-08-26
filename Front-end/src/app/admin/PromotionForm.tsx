"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Ticket } from "lucide-react";

const tiposPromocao = [
  "Desconto Percentual", "Desconto Fixo", "Leve Pague", "Brinde"
];

export default function PromotionForm() {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [desconto, setDesconto] = useState("");
  const [tipo, setTipo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast({
      title: "Sucesso!",
      description: "Promoção criada (simulado).",
      variant: "default",
    });
    // Reset form
    setNome("");
    setDesconto("");
    setTipo("");
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-primary">Criar Promoção</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Promoção</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Desconto de Verão" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desconto">Valor do Desconto</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">%</span>
              <Input id="desconto" type="number" value={desconto} onChange={e => setDesconto(e.target.value)} required className="pl-7" min="0" placeholder="15" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo de Promoção</Label>
            <Select value={tipo} onValueChange={setTipo} required>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposPromocao.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full">
            <Ticket className="mr-2 h-4 w-4" />
            Criar Promoção
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
