"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Tag as OfferIcon,
  Grid3X3 as CategoryIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  ShoppingCart as CartIcon
} from 'lucide-react';

interface SidebarMenuProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onShowOffers: () => void;
}

export default function SidebarMenu({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onShowOffers
}: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      label: 'Início', 
      icon: <HomeIcon className="w-5 h-5" />, 
      action: () => {
        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    },
    { 
      label: 'Ofertas Especiais', 
      icon: <OfferIcon className="w-5 h-5" />, 
      action: () => {
        onShowOffers();
        setIsOpen(false);
      },
      special: true
    },
    { 
      label: 'Sobre Nós', 
      icon: <InfoIcon className="w-5 h-5" />, 
      action: () => {
        document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    },
    { 
      label: 'Contato', 
      icon: <PhoneIcon className="w-5 h-5" />, 
      action: () => {
        document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden"
        aria-label="Abrir menu lateral"
      >
        <MenuIcon className="w-6 h-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-white to-green-50">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 bg-green-700 text-white relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SheetHeader>
                  <SheetTitle className="text-white text-xl font-bold text-left">
                    Jota Distribuidora
                  </SheetTitle>
                  <p className="text-green-100 text-sm mt-1">
                    Entregamos sua bebida onde você estiver 🍻🚚
                  </p>
                </SheetHeader>
              </motion.div>
              {/* Decorative circles */}
              <motion.div
                className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full bg-white/5"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Menu Items */}
            <div className="flex-1 pt-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-2 mx-4"
                >
                  <Button
                    variant={item.special ? "default" : "ghost"}
                    onClick={item.action}
                    className={`w-full justify-start gap-3 py-6 transition-all duration-300 hover:translate-x-2 ${
                      item.special 
                        ? 'bg-green-700 hover:bg-green-600 text-white' 
                        : 'hover:bg-green-100 text-gray-700'
                    }`}
                    role="menuitem"
                    aria-label={item.label}
                  >
                    <span className={item.special ? 'text-white' : 'text-green-700'}>
                      {item.icon}
                    </span>
                    <span className={item.special ? 'font-bold' : 'font-medium'}>
                      {item.label}
                    </span>
                    {item.special && (
                      <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0">
                        🔥
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              ))}

              <Separator className="my-4 mx-4" />

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="px-6 py-2 text-green-700 font-bold flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  Categorias
                </div>
                {categories.slice(1).map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="mb-1 mx-4"
                  >
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onCategorySelect(category);
                        setIsOpen(false);
                      }}
                      className={`w-full justify-start py-4 transition-all duration-300 hover:translate-x-1 hover:bg-green-100 ${
                        selectedCategory === category 
                          ? 'bg-green-100 text-green-700 font-bold' 
                          : 'text-gray-600'
                      }`}
                      role="menuitem"
                      aria-label={category}
                    >
                      <span className="text-sm">{category}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-green-50/50 text-center">
              <p className="text-xs text-gray-500">2024 Jota Distribuidora</p>
              <p className="text-xs text-gray-500">Qualidade e sabor em cada entrega</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
