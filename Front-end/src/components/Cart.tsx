"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Minus, Trash2, ShoppingCart, Ticket, Package } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Product } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Simple hook for media query
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

export default function Cart({ open, onClose, items, onAdd, onRemove, onDelete }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const FREE_SHIPPING_THRESHOLD = 150;
  const [couponCode, setCouponCode] = useState("");
  const [cep, setCep] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'CUPOM10') {
      const d = Math.min(subtotal * 0.1, 30);
      setDiscount(parseFloat(d.toFixed(2)));
    } else if (code === 'FRETEGRATIS') {
      setShipping(0);
    }
  };

  const calcShipping = () => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      setShipping(0);
      return;
    }
    if (/^\d{5}-?\d{3}$/.test(cep)) {
      const first2 = cep.replace(/\D/g, '').slice(0, 2);
      const val = Number(first2) >= 20 && Number(first2) <= 28 ? 19.9 : 24.9;
      setShipping(val);
    }
  };

  const total = Math.max(0, subtotal - discount) + shipping;

  const handleCheckout = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: total,
        items: items.map((it) => ({
          item_id: it.product.id,
          item_name: it.product.name,
          item_category: it.product.category,
          price: it.product.price,
          quantity: it.quantity,
        })),
      });
    }
    window.open('https://wa.me/5521970255214', '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side={isMobile ? 'bottom' : 'right'} className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center text-lg font-bold text-brand">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Carrinho
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Free shipping notice */}
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            {remaining > 0 ? (
              <div className="text-sm">
                <p className="font-semibold text-green-800">
                  Faltam {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para frete grátis!
                </p>
                <Progress value={progress} className="mt-2 h-2" />
              </div>
            ) : (
              <p className="font-bold text-green-800">Frete grátis aplicado! 🎉</p>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-sm">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <motion.div key={product.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-4 p-2 border rounded-lg bg-background">
                  <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md object-contain bg-white" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onRemove(product)}><Minus className="h-4 w-4" /></Button>
                      <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onAdd(product)}><Plus className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(product)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t bg-secondary/50">
          <div className="w-full space-y-4">
            {/* Cupom e CEP */}
            <div className="grid sm:grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cupom de desconto" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={applyCoupon}>Aplicar</Button>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Calcular frete (CEP)" value={cep} onChange={(e) => setCep(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={calcShipping}>Calcular</Button>
              </div>
            </div>

            <Separator />

            {/* Resumo */}
            <div className="space-y-1 text-sm font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>- {discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{shipping === 0 ? 'Grátis' : shipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
            <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700 text-white" disabled={items.length === 0} onClick={handleCheckout}>
              Finalizar Pedido no WhatsApp
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
