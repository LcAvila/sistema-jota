"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Zap, Star, ArrowLeft, Truck, Clock, Shield, Heart, Share2, Minus, Plus } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const handleWhatsApp = () => {
    if (!product) return;
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: 1 }],
      });
    }
    const url = `https://wa.me/5521970255214?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} - Quantidade: ${quantity} - Preço: R$ ${product.price.toFixed(2)}`)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      return exists
        ? prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...prev, { product, quantity }];
    });
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: product.price * quantity,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity }],
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
      <div className="min-h-screen" style={{ backgroundColor: '#EAF9E7' }}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-black mb-6" style={{ color: '#4CA771' }}>Produto não encontrado</h1>
            <Button asChild className="px-8 py-3 rounded-full font-bold text-lg" style={{ backgroundColor: '#4CA771', color: '#EAF9E7' }}>
              <Link href="/">Voltar para a Home</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAF9E7' }}>
      <Navbar 
        cartCount={cartCount}
        onCartClick={() => {}} // Função vazia para a página de produto
        cartItems={cartItems}
        onQuickAdd={handleQuickAdd}
        onQuickRemove={handleQuickRemove}
        onQuickDelete={handleQuickDelete}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="text-[#4CA771] hover:text-[#013237] hover:bg-[#C0E6BA] transition-all duration-200">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold text-[#013237]">Voltar para todos os produtos</span>
            </Link>
          </Button>
        </motion.div>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw" 
                className="object-cover transition-transform duration-300 hover:scale-105" 
              />
              
              {/* Sale Badge */}
              {product.isOnSale && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute top-4 left-4"
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg border-2 border-white">
                    <Zap className="h-4 w-4 mr-2" />
                    -{product.discount}% OFF
                  </Badge>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* Product Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 grid grid-cols-3 gap-4"
            >
              {[
                { icon: Truck, text: "Entrega 30min", color: "#4CA771" },
                { icon: Shield, text: "Qualidade", color: "#4CA771" },
                { icon: Clock, text: "Disponível", color: "#4CA771" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg"
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                  <span className="text-xs font-medium text-center" style={{ color: '#013237' }}>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4"
            >
              <Badge className="bg-[#C0E6BA] text-[#013237] font-semibold text-sm px-4 py-2 rounded-full border-2 border-[#4CA771]">
                {product.category}
              </Badge>
            </motion.div>

            {/* Product Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl lg:text-5xl font-black mb-4 leading-tight text-[#013237]"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold" style={{ color: '#4CA771' }}>5.0</span>
              <span className="text-sm font-medium" style={{ color: '#666' }}>(23 avaliações)</span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-lg mb-6 leading-relaxed text-[#013237]"
            >
              {product.description}
            </motion.p>

            {/* Price Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-8"
            >
              {product.isOnSale && product.originalPrice && (
                <p className="text-2xl text-gray-500 line-through mb-2 font-medium">
                  R$ {product.originalPrice.toFixed(2)}
                </p>
              )}
              <div className="flex items-center gap-4">
                <p className={`font-black ${product.isOnSale ? 'text-red-500 text-5xl' : 'text-[#013237] text-4xl'}`}>
                  R$ {product.price.toFixed(2)}
                </p>
                {product.isOnSale && (
                  <Badge className="bg-red-500 text-white font-bold text-lg px-4 py-2 rounded-full">
                    ECONOMIA DE R$ {(product.originalPrice! - product.price).toFixed(2)}
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mb-8"
            >
              <label className="block text-sm font-semibold mb-3 text-[#013237]">
                Quantidade:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[#C0E6BA] rounded-xl bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#EAF9E7] transition-colors duration-200"
                  >
                    <Minus className="h-5 w-5" style={{ color: '#4CA771' }} />
                  </button>
                  <span className="w-16 text-center font-bold text-lg" style={{ color: '#013237' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#EAF9E7] transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5" style={{ color: '#4CA771' }} />
                  </button>
                </div>
                <span className="text-lg font-semibold text-[#013237]">
                  Total: R$ {(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button 
                size="lg" 
                className="flex-1 py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#4CA771', color: '#EAF9E7' }}
                onClick={handleWhatsApp}
              >
                <Zap className="h-6 w-6 mr-3" />
                Comprar Agora
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 py-4 px-8 rounded-xl font-bold text-lg border-2 border-[#4CA771] text-[#4CA771] hover:bg-[#4CA771] hover:text-[#EAF9E7] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={handleAddToCart} 
                disabled={adding}
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                {adding ? 'Adicionado!' : 'Adicionar ao Carrinho'}
              </Button>
            </motion.div>

            {/* Product Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4 text-[#013237]">Especificações</h3>
                              <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#C0E6BA]">
                    <span className="font-semibold text-[#4CA771]">Categoria:</span>
                    <span className="text-[#013237]">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#C0E6BA]">
                    <span className="font-semibold text-[#4CA771]">Condição:</span>
                    <span className="text-[#013237]">{product.isOnSale ? 'Em promoção' : 'Preço normal'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-[#4CA771]">Disponibilidade:</span>
                    <span className="text-green-600 font-semibold">Em estoque</span>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4 text-[#013237]">Produtos Relacionados</h2>
              <p className="text-lg font-medium text-[#4CA771]">
                Você também pode gostar destes produtos
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link href={`/product/${p.id}`} className="block">
                    <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#4CA771]">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF9E7] mb-4">
                        <Image 
                          src={p.image} 
                          alt={p.name} 
                          fill 
                          className="object-cover transition-transform duration-300 group-hover:scale-110" 
                          sizes="(max-width: 768px) 50vw, 25vw" 
                        />
                        {p.isOnSale && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-full">
                            -{p.discount}%
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-[#013237] text-sm sm:text-base mb-2 group-hover:text-[#4CA771] transition-colors duration-200 line-clamp-2">
                        {p.name}
                      </h3>
                      <p className="font-bold text-[#4CA771] text-base sm:text-lg">
                        R$ {p.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
