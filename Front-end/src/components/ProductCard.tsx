"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Eye, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const StarRating = ({ rating, totalReviews }: { rating: number; totalReviews: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
    <span className="text-xs text-[#4CA771] font-semibold">{rating.toFixed(1)} ({totalReviews})</span>
  </div>
);

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      setAdding(true);
      onAddToCart(product);
      setTimeout(() => setAdding(false), 1200);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full max-w-xs mx-auto"
    >
      <Card variant="interactive" className="h-[580px] flex flex-col rounded-2xl overflow-hidden">
        <CardHeader className="p-0 relative">
          <div className="relative h-60 w-full overflow-hidden bg-green-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className={`transition-transform duration-300 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center"
                >
                  <Button asChild variant="secondary" size="icon" className="rounded-full h-12 w-12 hover:scale-110 transition-transform">
                    <Link href={`/product/${product.id}`} aria-label={`Ver detalhes do produto ${product.name}`}>
                      <Eye className="h-6 w-6" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {product.isOnSale && (
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg">
                <Zap className="h-4 w-4 mr-1" /> -{product.discount}%
              </Badge>
            </motion.div>
          )}
          <Badge variant="secondary" className="absolute top-3 right-3 bg-[#4CA771] hover:bg-[#4CA771]/90 text-white font-semibold">
            {product.category}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 flex flex-col flex-grow">
          <CardTitle className="text-lg font-extrabold text-[#013237] mb-1.5 line-clamp-2 h-[56px]">
            {product.name}
          </CardTitle>
          <p className="text-sm text-[#4CA771] mb-3 line-clamp-3 h-[60px] overflow-hidden">
            {product.description}
          </p>
          
          <div className="flex justify-between items-end mt-auto">
            <StarRating rating={5.0} totalReviews={23} />
            <div className="text-right">
              {product.isOnSale && product.originalPrice && (
                <span className="text-sm text-gray-500 line-through block">R$ {product.originalPrice.toFixed(2)}</span>
              )}
              <span className={`block font-bold ${product.isOnSale ? 'text-red-500 text-2xl' : 'text-[#4CA771] text-xl'}`}>
                R$ {product.price.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 flex flex-col gap-2 mt-auto">
          <Button asChild size="sm" className="w-full bg-[#4CA771] hover:bg-[#4CA771]/90 text-white font-semibold text-sm h-9">
            <a href={`https://wa.me/5521970255214?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
              Comprar Agora
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full border-[#4CA771] text-[#4CA771] hover:bg-[#EAF9E7] hover:text-[#013237] font-semibold text-sm h-9" onClick={handleAddToCart} disabled={adding}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            {adding ? 'Adicionado!' : 'Carrinho'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
