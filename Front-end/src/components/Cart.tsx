"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, Trash2, ShoppingCart, Ticket, Package, Truck, Clock, Shield, Zap, Heart, Share2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    
    setIsApplyingCoupon(true);
    // Simular delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (code === 'CUPOM10') {
      const d = Math.min(subtotal * 0.1, 30);
      setDiscount(parseFloat(d.toFixed(2)));
      // Mostrar feedback visual
    } else if (code === 'FRETEGRATIS') {
      setShipping(0);
      // Mostrar feedback visual
    } else {
      // Cupom inválido
      setCouponCode("");
    }
    setIsApplyingCoupon(false);
  };

  const calcShipping = async () => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      setShipping(0);
      return;
    }
    
    if (/^\d{5}-?\d{3}$/.test(cep)) {
      setIsCalculatingShipping(true);
      // Simular delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const first2 = cep.replace(/\D/g, '').slice(0, 2);
      const val = Number(first2) >= 20 && Number(first2) <= 28 ? 19.9 : 24.9;
      setShipping(val);
      setIsCalculatingShipping(false);
    }
  };

  const total = Math.max(0, subtotal - discount) + shipping;
  const totalSavings = discount + (shipping === 0 ? 24.9 : 0); // Economia total (desconto + frete grátis)

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
    
    // Criar mensagem personalizada para WhatsApp
    const message = `🛒 *Pedido JOTA Distribuidora*\n\n${items.map(item => 
      `• ${item.product.name} x${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n')}\n\n*Subtotal:* R$ ${subtotal.toFixed(2)}${discount > 0 ? `\n*Desconto:* -R$ ${discount.toFixed(2)}` : ''}\n*Frete:* ${shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}\n*Total:* R$ ${total.toFixed(2)}\n\n📍 *CEP:* ${cep || 'Não informado'}`;
    
    const url = `https://wa.me/5521970255214?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side={isMobile ? 'bottom' : 'right'} 
        className="flex flex-col p-0 sm:max-w-md bg-white border-l-2 border-[#C0E6BA] shadow-2xl" 
        style={{ 
          backgroundColor: '#FFFFFF !important',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none'
        }}
      >
        <SheetHeader className="p-6 border-b-2 border-[#C0E6BA] bg-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center text-2xl font-black text-[#013237]">
              <div className="w-12 h-12 rounded-full bg-[#4CA771] flex items-center justify-center mr-3">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              Seu Carrinho
            </SheetTitle>
            <SheetClose className="w-8 h-8 rounded-full bg-[#C0E6BA] hover:bg-[#4CA771] transition-colors duration-200 flex items-center justify-center">
              <X className="h-5 w-5 text-[#013237]" />
            </SheetClose>
          </div>
          
          {/* Contador de itens */}
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-[#4CA771] text-white font-bold px-3 py-1">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </Badge>
            <span className="text-sm text-[#4CA771] font-medium">
              Total: {formatCurrency(subtotal)}
            </span>
          </div>
          
          {/* Descrição para acessibilidade */}
          <SheetDescription className="sr-only">
            Carrinho de compras da JOTA Distribuidora com {items.length} {items.length === 1 ? 'item' : 'itens'} selecionado{items.length === 1 ? '' : 's'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Free shipping progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#4CA771] to-[#5DB580] text-white shadow-lg"
          >
            {remaining > 0 ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Truck className="h-5 w-5" />
                  <span className="font-bold text-lg">Frete Grátis!</span>
                </div>
                <p className="text-sm mb-3 opacity-90">
                  Faltam {formatCurrency(remaining)} para frete grátis
                </p>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div 
                    className="h-3 bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs opacity-75">{progress}% do objetivo</p>
                <div className="mt-3 p-2 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-90">Economia de até R$ 24,90 no frete</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Truck className="h-6 w-6" />
                  <span className="font-bold text-xl">Frete Grátis Aplicado! 🎉</span>
                </div>
                <p className="text-sm opacity-90">Parabéns! Você economizou R$ 24,90 no frete</p>
                <div className="mt-3 p-2 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-90">Continue aproveitando as ofertas!</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Cart items */}
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#C0E6BA] flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-[#4CA771]" />
              </div>
              <h3 className="text-xl font-bold text-[#013237] mb-2">Seu carrinho está vazio</h3>
              <p className="text-[#4CA771] mb-6">Adicione produtos para começar suas compras!</p>
              <Button 
                onClick={onClose}
                className="px-8 py-3 rounded-full font-bold bg-[#4CA771] hover:bg-[#5DB580] text-white"
              >
                Continuar Comprando
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {items.map(({ product, quantity }, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#4CA771]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="relative">
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          width={80} 
                          height={80} 
                          className="rounded-xl object-cover bg-[#EAF9E7]" 
                          style={{ width: 'auto', height: 'auto' }}
                        />
                        {product.isOnSale && (
                          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#013237] text-base mb-1 line-clamp-2 group-hover:text-[#4CA771] transition-colors duration-200">
                          {product.name}
                        </h4>
                        <p className="text-sm text-[#4CA771] mb-2">{product.category}</p>
                        
                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          {product.isOnSale && product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                          <span className="font-bold text-lg text-[#013237]">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border-2 border-[#C0E6BA] rounded-xl bg-white">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-[#EAF9E7] hover:text-[#4CA771] transition-colors duration-200" 
                              onClick={() => onRemove(product)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-[#013237]">{quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-[#EAF9E7] hover:text-[#4CA771] transition-colors duration-200" 
                              onClick={() => onAdd(product)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200" 
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Item Total */}
                        <div className="mt-3 pt-3 border-t border-[#C0E6BA]">
                          <p className="text-right font-bold text-[#4CA771]">
                            Total: {formatCurrency(product.price * quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-6 border-t-2 border-[#C0E6BA] bg-white">
          <div className="w-full space-y-6">
            {/* Cupom e CEP */}
            <div className="space-y-4">
              {/* Cupom */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#013237] flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-[#4CA771]" />
                  Cupom de desconto
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Digite seu cupom" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border-2 border-[#C0E6BA] focus:border-[#4CA771] focus:ring-[#4CA771] rounded-xl text-[#013237] placeholder:text-[#666] bg-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="border-2 border-[#4CA771] text-[#4CA771] hover:bg-[#4CA771] hover:text-white transition-colors duration-200 rounded-xl px-6"
                  >
                    {isApplyingCoupon ? 'Aplicando...' : 'Aplicar'}
                  </Button>
                </div>
                
                {/* Cupons disponíveis */}
                <div className="text-xs text-[#666] space-y-1">
                  <p className="font-medium">Cupons disponíveis:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#EAF9E7] text-[#4CA771] rounded-md font-mono text-xs">CUPOM10</span>
                    <span className="px-2 py-1 bg-[#EAF9E7] text-[#4CA771] rounded-md font-mono text-xs">FRETEGRATIS</span>
                  </div>
                </div>
              </div>
              
              {/* CEP */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#013237] flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#4CA771]" />
                  Calcular frete
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="00000-000" 
                    value={cep} 
                    onChange={(e) => setCep(e.target.value)}
                    className="flex-1 border-2 border-[#C0E6BA] focus:border-[#4CA771] focus:ring-[#4CA771] rounded-xl text-[#013237] placeholder:text-[#666] bg-white"
                  />
                  <Button 
                    variant="outline" 
                    onClick={calcShipping}
                    disabled={isCalculatingShipping || !cep.trim()}
                    className="border-2 border-[#4CA771] text-[#4CA771] hover:bg-[#4CA771] hover:text-white transition-colors duration-200 rounded-xl px-6"
                  >
                    {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="bg-[#C0E6BA]" />

            {/* Resumo financeiro */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#013237]">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                <span className="font-semibold text-[#013237]">{formatCurrency(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-green-600 font-medium">Desconto (CUPOM10)</span>
                  <span className="font-bold text-green-600">- {formatCurrency(discount)}</span>
                </motion.div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#013237]">Frete</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-[#013237]'}`}>
                  {shipping === 0 ? 'Grátis 🎉' : formatCurrency(shipping)}
                </span>
              </div>
              
                          <Separator className="bg-[#C0E6BA]" />
            
            {/* Economia total */}
            {totalSavings > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"
              >
                <p className="text-sm font-medium text-green-800">
                  🎉 Você economizou {formatCurrency(totalSavings)} no total!
                </p>
              </motion.div>
            )}
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-[#013237]">Total</span>
              <span className="text-[#4CA771] text-xl">{formatCurrency(total)}</span>
            </div>
            </div>

            {/* Botão de finalizar */}
            <Button 
              size="lg" 
              className="w-full font-bold text-lg py-4 rounded-2xl bg-gradient-to-r from-[#4CA771] to-[#5DB580] hover:from-[#5DB580] hover:to-[#4CA771] text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={items.length === 0} 
              onClick={handleCheckout}
            >
              <span>Finalizar Pedido no WhatsApp</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {/* Informações do pedido */}
            <div className="text-center space-y-2">
              <p className="text-xs text-[#666]">
                Pedido será processado via WhatsApp em até 2 minutos
              </p>
              <p className="text-xs text-[#4CA771] font-medium">
                Entrega em até 30 minutos após confirmação
              </p>
            </div>
            
            {/* Informações adicionais */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-xs text-[#4CA771]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Entrega 30min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Qualidade Garantida</span>
                </div>
              </div>
              <p className="text-xs text-[#666]">
                Seu pedido será processado via WhatsApp
              </p>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
