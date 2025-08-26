"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Zap, Star, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = React.use(params);
  const id = Number(idStr);
  const product = useMemo<Product | undefined>(() => products.find(p => p.id === id), [id]);

  const related = useMemo<Product[]>(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  useEffect(() => {
    if (!product || typeof window === 'undefined' || !(window as any).gtag) return;
    (window as any).gtag('event', 'view_item', {
      currency: 'BRL',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: 1 }],
    });
  }, [product]);

  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [adding, setAdding] = useState(false);

  const handleWhatsApp = () => {
    if (!product) return;
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: 1 }],
      });
    }
    const url = `https://wa.me/5521970255214?text=${encodeURIComponent('Olá! Tenho interesse no produto: ' + product.name)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      return exists
        ? prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { product, quantity: 1 }];
    });
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: 1 }],
      });
    }
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
  };

  const handleQuickAdd = (p: Product) => setCartItems(prev => prev.map(it => it.product.id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
  const handleQuickRemove = (p: Product) => setCartItems(prev => prev.map(it => it.product.id === p.id ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it));
  const handleQuickDelete = (p: Product) => setCartItems(prev => prev.filter(it => it.product.id !== p.id));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-brand mb-4">Produto não encontrado</h1>
        <Button asChild>
          <Link href="/">Voltar para a Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Navbar 
        cartCount={cartCount}
        cartItems={cartItems}
        onQuickAdd={handleQuickAdd}
        onQuickRemove={handleQuickRemove}
        onQuickDelete={handleQuickDelete}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-4 text-brand hover:text-brand-dark">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Voltar para todos os produtos</Link>
        </Button>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square rounded-lg border-2 border-green-100 overflow-hidden">
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            {product.isOnSale && (
              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg">
                <Zap className="h-4 w-4 mr-1" /> -{product.discount}%
              </Badge>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{product.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="bg-brand hover:bg-brand/90 text-white font-semibold text-sm">{product.category}</Badge>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                <span className="text-sm text-muted-foreground font-semibold ml-1">5.0 (23)</span>
              </div>
            </div>
            <div className="mb-6">
              {product.isOnSale && product.originalPrice && (
                <p className="text-xl text-gray-500 line-through">R$ {product.originalPrice.toFixed(2)}</p>
              )}
              <p className={`font-extrabold ${product.isOnSale ? 'text-red-500 text-4xl' : 'text-brand text-3xl'}`}>
                R$ {product.price.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="w-full sm:w-auto bg-brand hover:bg-brand/90 font-bold text-base" onClick={handleWhatsApp}>
                <Zap className="h-5 w-5 mr-2" /> Comprar Agora
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-brand text-brand hover:bg-green-50 hover:text-brand font-bold text-base" onClick={handleAddToCart} disabled={adding}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {adding ? 'Adicionado!' : 'Adicionar ao Carrinho'}
              </Button>
            </div>

            <Separator className="my-8" />

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Especificações</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><span className="font-semibold">Categoria:</span> {product.category}</li>
                <li><span className="font-semibold">Condição:</span> {product.isOnSale ? 'Em promoção' : 'Preço normal'}</li>
                <li><span className="font-semibold">Disponibilidade:</span> Em estoque</li>
              </ul>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="border-2 border-green-100 rounded-lg p-3 hover:border-brand hover:shadow-lg transition-all group">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-green-50 mb-3">
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-brand">{p.name}</h3>
                  <p className="font-bold text-brand text-base sm:text-lg">R$ {p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
