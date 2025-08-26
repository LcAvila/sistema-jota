"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { products, categories } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
 

import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import SidebarMenu from "@/components/SidebarMenu";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";



export default function Home() {
  // --- ESTADO DO CARRINHO ---
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GA4 helper
  const trackEvent = (event: string, params: Record<string, any> = {}) => {
    // Dispara somente no cliente e se gtag existir
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, params);
    }
  };

  // Adiciona produto ao carrinho
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    // GA4: add_to_cart
    trackEvent('add_to_cart', {
      currency: 'BRL',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1
      }]
    });
  };

  // Remove uma unidade do produto
  const handleRemoveFromCart = (product: Product) => {
    setCartItems(prev => prev.map(item => item.product.id === product.id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  };

  // Remove produto totalmente
  const handleDeleteFromCart = (product: Product) => {
    setCartItems(prev => prev.filter(item => item.product.id !== product.id));
  };

  // Quantidade total de itens
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // --- FILTRO SOMENTE POR CATEGORIA ---

  const [showProducts, setShowProducts] = useState(false);
  const [showOffers, setShowOffers] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);





  let filteredProducts = (selectedCategory === "Todos"
    ? products
    : products.filter(product => product.category === selectedCategory));

  // Filtrar produtos em oferta
  const offersProducts = products.filter(product => product.isOnSale);
  
  // Função para mostrar ofertas
  const handleShowOffers = () => {
    setShowOffers(true);
    setShowAllProducts(false);
    setShowProducts(false);
    trackEvent('view_promotion', { section: 'ofertas_especiais' });
  };

  // Função para mostrar todos os produtos
  const handleShowAllProducts = () => {
    setShowOffers(false);
    setShowAllProducts(true);
    setShowProducts(true);
    trackEvent('view_item_list', { list_name: 'todos_produtos' });
  };

  // Busca com autocomplete
  const [searchValue, setSearchValue] = useState<string>("");
  const handleSelectProduct = (_: any, value: any) => {
    if (!value) return;
    // Ao selecionar um produto, filtra pela categoria e rola até a seção
    if (value.category) setSelectedCategory(value.category);
    const el = document.getElementById("produtos");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Loading inicial para skeletons
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Refs para scroll horizontal
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollCats = (dir: "left" | "right") => {
    const el = catScrollRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const delta = containerWidth * 0.7; // Scroll 70% da largura visível
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  };

  const scrollProducts = (dir: "left" | "right") => {
    const el = productsScrollRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const delta = containerWidth * 0.8; // Scroll 80% da largura visível para produtos
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  };

  // Função para atualizar fades das categorias baseado no scroll
  const updateCategoryFades = () => {
    const el = catScrollRef.current;
    if (!el) return;
    
    const fadeLeft = document.getElementById('category-fade-left');
    const fadeRight = document.getElementById('category-fade-right');
    if (!fadeLeft || !fadeRight) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    
    fadeLeft.style.opacity = canScrollLeft ? '1' : '0';
    fadeRight.style.opacity = canScrollRight ? '1' : '0';
  };

  // Função para atualizar fades dos produtos baseado no scroll
  const updateProductsFades = () => {
    const el = productsScrollRef.current;
    if (!el) return;
    
    const fadeLeft = document.getElementById('products-fade-left');
    const fadeRight = document.getElementById('products-fade-right');
    if (!fadeLeft || !fadeRight) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    
    fadeLeft.style.opacity = canScrollLeft ? '1' : '0';
    fadeRight.style.opacity = canScrollRight ? '1' : '0';
  };

  // Drag-to-scroll no filtro de categorias
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = catScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = catScrollRef.current;
    if (!el || !isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1; // velocidade
    el.scrollLeft = scrollLeftRef.current - walk;
  };
  const endDrag = () => {
    const el = catScrollRef.current;
    isDraggingRef.current = false;
    if (el) el.style.cursor = 'grab';
  };
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = catScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = catScrollRef.current;
    if (!el || !isDraggingRef.current) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1;
    el.scrollLeft = scrollLeftRef.current - walk;
  };
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Handler CTA para rolar até ofertas
  const handleScrollToOffers = () => {
    const el = document.getElementById("ofertas");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    trackEvent('select_promotion', { cta: 'ver_ofertas' });
  };

  // Handler CTA para rolar até produtos
  const handleScrollToProducts = () => {
    const el = document.getElementById("produtos");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    trackEvent('select_content', { cta: 'conheca_catalogo', content_type: 'cta' });
  };

  // Inicializar fades após montagem
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCategoryFades();
      updateProductsFades();
    }, 100);
    return () => clearTimeout(timer);
  }, [categories, filteredProducts]);

  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAF9E7' }}>
      {/* Professional Sidebar Menu */}
      <SidebarMenu 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onShowOffers={handleShowOffers}
      />
      
      
      {/* Drawer do carrinho */}
      <Cart 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onDelete={handleDeleteFromCart}
      />
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setCartOpen(true)} 
        cartItems={cartItems}
        onQuickAdd={(p) => handleAddToCart(p)}
        onQuickRemove={(p) => handleRemoveFromCart(p)}
        onQuickDelete={(p) => handleDeleteFromCart(p)}
      />

      

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden" 
        style={{ backgroundColor: '#4CA771' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-10 left-10 w-32 h-32 rounded-full" 
            style={{ backgroundColor: '#C0E6BA' }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-40 right-20 w-24 h-24 rounded-full" 
            style={{ backgroundColor: '#C0E6BA' }}
            animate={{ 
              y: [0, 15, 0],
              x: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full" 
            style={{ backgroundColor: '#C0E6BA' }}
            animate={{ 
              rotate: [0, -180, -360],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.h1 
              className="text-5xl lg:text-7xl font-black mb-6" 
              style={{ color: '#EAF9E7' }}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              JOTA Distribuidora
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl mb-8 font-medium max-w-3xl mx-auto" 
              style={{ color: '#C0E6BA' }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              suppressHydrationWarning
            >
              Distribuidora de alimentos para bares, restaurantes e afins. Mais facilidade e praticidade para seu estabelecimento.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-3 px-6 py-4 rounded-full backdrop-blur-sm" 
                style={{ backgroundColor: 'rgba(192, 230, 186, 0.2)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: '#C0E6BA' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
                <span className="font-semibold text-lg" style={{ color: '#EAF9E7' }}>Aberto agora</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 px-6 py-4 rounded-full backdrop-blur-sm" 
                style={{ backgroundColor: 'rgba(192, 230, 186, 0.2)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="#EAF9E7" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </motion.svg>
                <span className="font-semibold text-lg" style={{ color: '#EAF9E7' }}>Entrega em 30min</span>
              </motion.div>
            </motion.div>

            {/* Busca de produtos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="max-w-2xl mx-auto"
            >
              {/* Input de busca com dropdown custom (sem MUI) */}
              <div className="relative">
                <div className="relative">
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Busque por produtos (ex: Heineken, Gelo, Água, Refrigerantes...)"
                    className="w-full rounded-xl border border-[#C0E6BA] bg-white pl-10 pr-4 py-3 shadow-[0_6px_24px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#4CA771]"
                    aria-label="Buscar produtos"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4CA771]" />
                </div>
                {searchValue && (
                  <ul className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[#C0E6BA] bg-white shadow-lg">
                    {products
                      .filter((p) => p.name.toLowerCase().includes(searchValue.toLowerCase()))
                      .slice(0, 10)
                      .map((option) => (
                        <li
                          key={option.id}
                          className="cursor-pointer px-4 py-2 hover:bg-[#EAF9E7]"
                          onClick={() => handleSelectProduct(null as any, option)}
                        >
                          {option.name}
                        </li>
                      ))}
                    {products.filter((p) => p.name.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
                      <li className="px-4 py-2 text-sm text-muted-foreground">Nenhum resultado</li>
                    )}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <motion.button
                onClick={handleScrollToOffers}
                className="px-8 py-3 rounded-full font-bold text-lg"
                style={{ backgroundColor: '#EAF9E7', color: '#4CA771', border: '2px solid #C0E6BA', boxShadow: '0 6px 18px rgba(0,0,0,0.10)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Ver ofertas"
              >
                Ver ofertas 🔥
              </motion.button>
              <motion.button
                onClick={handleScrollToProducts}
                className="px-8 py-3 rounded-full font-bold text-lg"
                style={{ backgroundColor: '#4CA771', color: '#EAF9E7', border: '2px solid #C0E6BA', boxShadow: '0 6px 18px rgba(0,0,0,0.10)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Conheça nosso catálogo"
              >
                Conheça nosso catálogo 📦
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Special Offers Section - Always Visible */}
      {showOffers && (
        <motion.section 
          id="ofertas" 
          className="py-20" 
          style={{ backgroundColor: '#D4E9E2' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 mb-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.span 
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  🔥
                </motion.span>
                <motion.h2 
                  className="text-5xl font-black" 
                  style={{ color: '#000000' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Ofertas Especiais
                </motion.h2>
                <motion.span 
                  className="text-6xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  💰
                </motion.span>
              </motion.div>
              
              <motion.p 
                className="text-xl font-semibold max-w-3xl mx-auto" 
                style={{ color: '#4CA771' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Aproveite nossos preços promocionais! Produtos selecionados com descontos imperdíveis 🎯
              </motion.p>
              
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.button
                  onClick={handleShowAllProducts}
                  className="px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: '#4CA771',
                    color: '#EAF9E7',
                    border: '2px solid #4CA771'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Todos os Produtos 📦
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Offers Grid */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="h-[180px] w-full rounded-lg bg-[#C0E6BA]" />
                      <div className="h-5 w-4/5 rounded bg-[#C0E6BA]" />
                      <div className="h-4 w-3/5 rounded bg-[#C0E6BA]" />
                      <div className="h-9 w-[140px] rounded bg-[#C0E6BA]" />
                    </div>
                  ))
                : offersProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="w-full max-w-[320px]"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.6 + index * 0.15,
                        ease: "easeOut"
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </motion.div>
                  ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.div
                className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(0, 117, 74, 0.1)' }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-3xl">⏰</span>
                <div>
                  <p className="text-lg font-bold" style={{ color: '#4CA771' }}>
                    Ofertas por tempo limitado!
                  </p>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Não perca essas oportunidades incríveis
                  </p>
                </div>
                <span className="text-3xl">🚀</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Produtos Minimalistas em Linha (Horizontal Scroll) */}
      <section id="produtos" className="py-16" style={{ backgroundColor: '#C0E6BA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#013237' }}>Nossos Produtos</h2>
            <p className="text-base md:text-lg font-medium max-w-2xl mx-auto" style={{ color: '#4CA771' }}>
              Produtos frescos e de qualidade, selecionados especialmente para você
            </p>
          </div>

          {/* Filtro de categorias elegante e responsivo */}
          <div className="flex items-center gap-3 mb-8 category-filter-mobile md:gap-3">
            {/* Seta esquerda - ao lado do filtro */}
            <button
              onClick={() => scrollCats("left")}
              aria-label="Scroll esquerda"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#C0E6BA] hover:bg-[#EAF9E7] hover:border-[#4CA771] transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md group"
            >
              <ChevronLeft className="h-4 w-4 text-[#4CA771] group-hover:text-[#013237]" />
            </button>

            {/* Container do filtro com gradientes condicionais */}
            <div className="relative flex-1 overflow-hidden">
              {/* Gradientes laterais aparecem apenas quando há overflow */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#EAF9E7] to-transparent z-10 pointer-events-none transition-opacity duration-300"
                id="category-fade-left"
                style={{ opacity: 0 }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#EAF9E7] to-transparent z-10 pointer-events-none transition-opacity duration-300"
                id="category-fade-right"
                style={{ opacity: 0 }}
              />
              
              <div
                ref={catScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-6"
                style={{ 
                  scrollBehavior: 'smooth', 
                  cursor: 'grab', 
                  scrollSnapType: 'x mandatory'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onScroll={updateCategoryFades}
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 text-sm category-button-mobile ${
                      selectedCategory === category
                        ? "bg-[#4CA771] text-white shadow-md scale-105"
                        : "bg-white text-[#4CA771] border border-[#C0E6BA] hover:bg-[#EAF9E7] hover:border-[#4CA771] hover:scale-102"
                    }`}
                    style={{ 
                      minWidth: 80, 
                      scrollSnapAlign: 'center'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Seta direita - ao lado do filtro */}
            <button
              onClick={() => scrollCats("right")}
              aria-label="Scroll direita"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#C0E6BA] hover:bg-[#EAF9E7] hover:border-[#4CA771] transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md group"
            >
              <ChevronRight className="h-4 w-4 text-[#4CA771] group-hover:text-[#013237]" />
            </button>
          </div>

          {/* Controles removidos: ordenação e filtros por preço/ofertas */}

          {/* Carrossel horizontal de produtos com setas e blur condicional */}
          <div className="flex items-center gap-3 mb-8">
            {/* Seta esquerda para produtos */}
            <button
              onClick={() => scrollProducts("left")}
              aria-label="Produtos anteriores"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#C0E6BA] hover:bg-[#EAF9E7] hover:border-[#4CA771] transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md group"
            >
              <ChevronLeft className="h-4 w-4 text-[#4CA771] group-hover:text-[#013237]" />
            </button>

            <div className="relative flex-1 overflow-hidden">
              {/* Gradientes condicionais para cards */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#EAF9E7] to-transparent z-10 pointer-events-none transition-opacity duration-300"
                id="products-fade-left"
                style={{ opacity: 0 }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#EAF9E7] to-transparent z-10 pointer-events-none transition-opacity duration-300"
                id="products-fade-right"
                style={{ opacity: 0 }}
              />
              
              <motion.div
                ref={productsScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-6"
                style={{ 
                  cursor: 'grab',
                  scrollBehavior: 'smooth',
                  scrollSnapType: 'x mandatory'
                }}
                whileTap={{ cursor: 'grabbing' }}
                onScroll={updateProductsFades}
              >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                    <div className="flex flex-col gap-3">
                      <div className="h-[160px] w-full rounded-lg bg-[#e9f4f0]" />
                      <div className="h-5 w-3/4 rounded bg-[#e9f4f0]" />
                      <div className="h-4 w-1/2 rounded bg-[#e9f4f0]" />
                      <div className="h-8 w-[120px] rounded bg-[#e9f4f0]" />
                    </div>
                  </div>
                ))
              : filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    className="min-w-[280px] max-w-[300px] flex-shrink-0"
                    style={{ scrollSnapAlign: 'start' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * idx }}
                    whileHover={{ scale: 1.04, y: -4, zIndex: 30 }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Seta direita para produtos */}
            <button
              onClick={() => scrollProducts("right")}
              aria-label="Próximos produtos"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#C0E6BA] hover:bg-[#EAF9E7] hover:border-[#4CA771] transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md group"
            >
              <ChevronRight className="h-4 w-4 text-[#4CA771] group-hover:text-[#013237]" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <motion.section 
        className="py-20" 
        style={{ backgroundColor: '#FFFFFF' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl font-black mb-4" 
              style={{ color: '#000000' }}
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Por que escolher a Jota?
            </motion.h2>
            <motion.p 
              className="text-lg font-medium" 
              style={{ color: '#00754A' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Qualidade e conveniência em cada entrega
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Entrega Rápida",
                description: "Receba seus produtos em até 30 minutos",
                delay: 0.2
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Qualidade Garantida",
                description: "Produtos sempre frescos e de qualidade",
                delay: 0.4
              },
              {
                icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Pagamento Fácil",
                description: "Cartão, PIX ou dinheiro na entrega",
                delay: 0.6
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                className="text-center p-8 rounded-2xl transition-all duration-300" 
                style={{ backgroundColor: '#D4E9E2' }}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: service.delay,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: '#4CA771' }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: service.delay + 0.2,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                  viewport={{ once: true }}
                >
                  <motion.svg 
                    className="w-8 h-8" 
                    fill="none" 
                    stroke="#EAF9E7" 
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: service.delay + 0.4
                    }}
                    viewport={{ once: true }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </motion.svg>
                </motion.div>
                <motion.h3 
                  className="text-xl font-bold mb-3" 
                  style={{ color: '#000000' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: service.delay + 0.3
                  }}
                  viewport={{ once: true }}
                >
                  {service.title}
                </motion.h3>
                <motion.p 
                  className="font-medium" 
                  style={{ color: '#4CA771' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: service.delay + 0.4
                  }}
                  viewport={{ once: true }}
                >
                  {service.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
