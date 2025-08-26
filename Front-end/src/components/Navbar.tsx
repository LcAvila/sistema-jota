"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Menu, X, MapPin, Phone, Mail, MessageCircle, CheckCircle, Clock, ShoppingCart, Plus, Minus, Trash2, Search, Bell, User, ChevronDown, Star, Zap, Shield } from 'lucide-react';

// Removido hook useMediaQuery para evitar hidratação inconsistente

const menuItems = [
  { label: 'Início', href: '#', primary: true, icon: <Star size={16} /> },
  { label: 'Produtos', href: '#produtos', icon: <ShoppingCart size={16} /> },
  { label: 'Sobre Nós', href: '#sobre', icon: <Shield size={16} /> },
  { label: 'Contato', href: '#contato', icon: <MessageCircle size={16} /> }
];

const InfoBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
    {icon}
    <span>{text}</span>
  </div>
);

const StatusChip = ({ icon, text, pulse = false }: { icon: React.ReactNode; text: string; pulse?: boolean }) => (
  <Badge variant="secondary" className="py-1 px-3 bg-green-100 text-green-800 hover:bg-green-200 border-none">
    {pulse && (
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mr-2">
        <div className="w-2 h-2 rounded-full bg-green-600" />
      </motion.div>
    )}
    {!pulse && <div className="mr-2">{icon}</div>}
    <span className="font-bold text-sm">{text}</span>
  </Badge>
);

export default function Navbar({ cartCount, onCartClick, cartItems = [], onQuickAdd, onQuickRemove, onQuickDelete }: { cartCount: number; onCartClick: () => void; cartItems?: { product: any; quantity: number }[]; onQuickAdd?: (p: any) => void; onQuickRemove?: (p: any) => void; onQuickDelete?: (p: any) => void; }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  const CartButton = ({ isMobileButton = false }) => (
    <Button
      onClick={onCartClick}
      aria-label="Abrir carrinho"
      variant="outline"
      size="icon"
      className={`relative bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 border-none ${isMobileButton ? '' : 'ml-1'}`}>
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {cartCount}
        </div>
      )}
    </Button>
  );

  const CartPreview = () => (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div onMouseEnter={(e) => e.currentTarget.click()} onMouseLeave={(e) => e.currentTarget.blur()}>
         <CartButton />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 shadow-lg border-green-200" align="end">
        <h4 className="font-bold text-md text-green-800 mb-2">Seu Carrinho</h4>
        <Separator className="mb-3" />
        {cartItems.length > 0 ? (
          <div className="space-y-3">
            {cartItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-sm">{item.product?.name || 'Produto'}</p>
                  <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                </div>
                <p className="font-bold text-sm">{typeof item.product?.price === 'number' ? item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</p>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onQuickRemove && onQuickRemove(item.product)}><Minus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onQuickAdd && onQuickAdd(item.product)}><Plus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onQuickDelete && onQuickDelete(item.product)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            {cartItems.length > 4 && <p className="text-xs text-muted-foreground">+ {cartItems.length - 4} outros itens</p>}
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-md">
              <span>Subtotal</span>
              <span>{cartItems.reduce((sum, it) => sum + (Number(it.product?.price) || 0) * it.quantity, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <Button className="w-full mt-3 bg-brand hover:bg-brand/90" onClick={onCartClick}>Ver Carrinho Completo</Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );

  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-1">
      {menuItems.map(item => (
        <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            asChild 
            className="relative font-semibold text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200 group"
          >
            <Link href={item.href} className="flex items-center gap-2">
              <span className="text-green-600 group-hover:text-green-700 transition-colors">{item.icon}</span>
              {item.label}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </Link>
          </Button>
        </motion.div>
      ))}
    </nav>
  );

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden bg-green-100 text-green-800 hover:bg-green-200 border-none">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] bg-green-50 p-4">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-green-800 text-center">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {menuItems.map(item => (
            <Button key={item.label} variant="ghost" asChild className="font-bold text-md justify-start p-6 text-green-800 hover:bg-green-200">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-green-100"
    >
      {/* Enhanced Top Bar */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800 py-2.5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <InfoBadge icon={<MapPin size={14} />} text="Mesquita - RJ" />
            <InfoBadge icon={<Phone size={14} />} text="(21) 99801-4824" />
            <InfoBadge icon={<Mail size={14} />} text="jotacomerciorio@gmail.com" />
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge variant="outline" className="border-green-300 text-green-100 bg-green-800/30 backdrop-blur-sm">
              <CheckCircle size={14} className="mr-1.5"/>Aceitamos Cartão e PIX
            </Badge>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="sm" className="bg-white text-green-800 hover:bg-green-50 rounded-full px-4 font-semibold shadow-md">
                <a href="https://wa.me/5521970255214" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} className="mr-2"/> WhatsApp
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="h-20 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href="/" aria-label="Página inicial">
              <Image
                src="/assets/logo/logo.png"
                width={140}
                height={70}
                alt="Jota Distribuidora Logo"
                className="h-auto w-auto drop-shadow-sm"
                priority
              />
            </Link>
          </motion.div>

          <DesktopNav />

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative hidden lg:flex hover:bg-green-50 rounded-full">
                <Bell className="h-5 w-5 text-gray-600" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Button>
            </motion.div>

            <div className="hidden lg:flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full border border-green-200"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold text-green-700">Aberto agora</span>
              </motion.div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full border border-blue-200">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Entrega 30min</span>
              </div>
              
              <CartPreview />
            </div>
            
            <div className="flex lg:hidden items-center gap-2">
              <CartButton isMobileButton />
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
