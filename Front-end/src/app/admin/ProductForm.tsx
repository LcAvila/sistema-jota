"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";

const categorias = [
  "Bebidas", "Snacks", "Água", "Energéticos", "Combos", "Outros"
];

export default function ProductForm() {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast({
      title: "Sucesso!",
      description: "Produto cadastrado (simulado).",
      variant: "default",
    });
    // Reset form
    setNome(""); 
    setPreco(""); 
    setCategoria("");
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-primary">Cadastrar Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input id="nome" value={nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)} required placeholder="Ex: Coca-Cola 2L" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">R$</span>
              <Input id="preco" type="number" value={preco} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreco(e.target.value)} required className="pl-9" min="0" step="0.01" placeholder="10.99" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria} required>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
