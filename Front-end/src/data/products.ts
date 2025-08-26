import { Product } from '@/types';

export const products: Product[] = [
  // Temperos e Condimentos - OFERTAS
  {
    id: 1,
    name: "Alho Descascado 1kg",
    price: 15.90,
    originalPrice: 18.90,
    image: "/assets/produtos/alho descascado 1kl.heic",
    category: "Temperos",
    description: "Alho descascado fresco, prático e de qualidade superior",
    isOnSale: true,
    discount: 16
  },
  {
    id: 2,
    name: "Alho Frito Granulado",
    price: 12.50,
    image: "/assets/produtos/alho frito granulado.webp",
    category: "Temperos",
    description: "Alho frito granulado crocante, ideal para finalizar pratos"
  },
  {
    id: 3,
    name: "Azeite Extra Virgem",
    price: 19.90,
    originalPrice: 24.90,
    image: "/assets/produtos/azeite extra virgem.jpg",
    category: "Temperos",
    description: "Azeite extra virgem premium, sabor e qualidade excepcionais",
    isOnSale: true,
    discount: 20
  },
  {
    id: 4,
    name: "Ajinomoto Realçador de Sabor",
    price: 8.90,
    image: "/assets/produtos/ajinomono.heic",
    category: "Temperos",
    description: "Realçador de sabor Ajinomoto, traz o melhor dos seus pratos"
  },
  {
    id: 5,
    name: "Açafrão em Pó",
    price: 12.90,
    originalPrice: 15.90,
    image: "/assets/produtos/açafrão.heic",
    category: "Temperos",
    description: "Açafrão puro, cor e sabor únicos para suas receitas",
    isOnSale: true,
    discount: 19
  },
  {
    id: 6,
    name: "Colorau Premium",
    price: 6.90,
    image: "/assets/produtos/colorau.heic",
    category: "Temperos",
    description: "Colorau de primeira qualidade para temperar e colorir"
  },
  {
    id: 7,
    name: "Cominho Moído",
    price: 9.50,
    image: "/assets/produtos/cominho moído.heic",
    category: "Temperos",
    description: "Cominho moído aromático, ideal para carnes e feijão"
  },
  {
    id: 8,
    name: "Lemon Pepper",
    price: 7.90,
    image: "/assets/produtos/lemon pepper.heic",
    category: "Temperos",
    description: "Tempero lemon pepper para carnes e aves"
  },
  {
    id: 9,
    name: "Pimenta do Reino Moída 1kg",
    price: 12.90,
    image: "/assets/produtos/pimenta do reino moído 1kl.heic",
    category: "Temperos",
    description: "Pimenta do reino moída na hora, aroma intenso"
  },
  {
    id: 10,
    name: "Tempero do Chef",
    price: 8.50,
    image: "/assets/produtos/tempero do chef.heic",
    category: "Temperos",
    description: "Tempero completo com ervas selecionadas"
  },

  // Conservas
  {
    id: 11,
    name: "Azeitona Verde Especial",
    price: 7.80,
    image: "/assets/produtos/azeitona verde.heic",
    category: "Conservas",
    description: "Azeitonas verdes selecionadas, conservadas em salmoura"
  },
  {
    id: 12,
    name: "Alcaparras Importadas",
    price: 18.90,
    image: "/assets/produtos/alcaparras.heic",
    category: "Conservas",
    description: "Alcaparras importadas de primeira qualidade"
  },
  {
    id: 13,
    name: "Pimenta Biquinho",
    price: 11.50,
    image: "/assets/produtos/pimenta biquinho.heic",
    category: "Conservas",
    description: "Pimenta biquinho doce, perfeita para petiscos"
  },
  {
    id: 14,
    name: "Cogumelo Fatiado",
    price: 13.90,
    image: "/assets/produtos/cogumelo fatiado.heic",
    category: "Conservas",
    description: "Cogumelos fatiados em conserva, prontos para usar"
  },

  // Carnes
  {
    id: 15,
    name: "Carne Seca 5kg",
    price: 89.90,
    image: "/assets/produtos/carne seca 5kl.heic",
    category: "Carnes",
    description: "Carne seca de primeira qualidade, ideal para feijoada"
  },
  {
    id: 16,
    name: "Linguiça Calabresa 5kg",
    price: 45.90,
    image: "/assets/produtos/linguiça calabresa 5kl.heic",
    category: "Carnes",
    description: "Linguiça calabresa defumada, perfeita para churrascos"
  },
  {
    id: 17,
    name: "Linguiça Mineira",
    price: 28.90,
    image: "/assets/produtos/linguiça mineira.heic",
    category: "Carnes",
    description: "Linguiça mineira tradicional com tempero caseiro"
  },
  {
    id: 18,
    name: "Linguiça Suína Artesanal",
    price: 32.50,
    image: "/assets/produtos/linguiça suina.heic",
    category: "Carnes",
    description: "Linguiça suína artesanal com tempero especial"
  },

  // Massas
  {
    id: 19,
    name: "Massa de Lasanha 2kg",
    price: 16.90,
    image: "/assets/produtos/lasanha 2kl.heic",
    category: "Massas",
    description: "Massa de lasanha fresca, ideal para pratos especiais"
  },
  {
    id: 20,
    name: "Nhoque Artesanal 1kg",
    price: 12.90,
    image: "/assets/produtos/nhoque 1kl.heic",
    category: "Massas",
    description: "Nhoque artesanal feito com batata selecionada"
  },
  {
    id: 21,
    name: "Massa de Pastel Disco",
    price: 8.90,
    image: "/assets/produtos/massa de pastel disco.heic",
    category: "Massas",
    description: "Massa de pastel em disco, pronta para rechear"
  },
  {
    id: 22,
    name: "Massa de Lasanha",
    price: 14.90,
    image: "/assets/produtos/massa de lasanha.webp",
    category: "Massas",
    description: "Massa de lasanha tradicional"
  },
  {
    id: 23,
    name: "Massa de Nhoque",
    price: 11.90,
    image: "/assets/produtos/massa de nhoque.webp",
    category: "Massas",
    description: "Massa de nhoque pronta para cozinhar"
  },
  {
    id: 24,
    name: "Massa de Pastel",
    price: 7.90,
    image: "/assets/produtos/massa de pastel.webp",
    category: "Massas",
    description: "Massa de pastel fina e crocante"
  },

  // Farinhas
  {
    id: 25,
    name: "Farinha de Rosca 10kg",
    price: 35.90,
    image: "/assets/produtos/farinha de rosca 10kl.heic",
    category: "Farinhas",
    description: "Farinha de rosca fina para empanados e frituras"
  },
  {
    id: 26,
    name: "Farinha de Rosca",
    price: 8.90,
    image: "/assets/produtos/farinha de rosca.webp",
    category: "Farinhas",
    description: "Farinha de rosca tradicional"
  },

  // Vegetais
  {
    id: 27,
    name: "Aipim Descascado 10kg",
    price: 25.90,
    image: "/assets/produtos/aipim descascado 10kl.heic",
    category: "Vegetais",
    description: "Aipim descascado e higienizado, pronto para preparo"
  },
  {
    id: 28,
    name: "Alho Descascado 1kg",
    price: 18.90,
    image: "/assets/produtos/alho descascado 1kl.heic",
    category: "Vegetais",
    description: "Alho descascado e selecionado, economia de tempo"
  },
  {
    id: 29,
    name: "Alho Descascado Premium",
    price: 12.90,
    image: "/assets/produtos/alho descascado.png",
    category: "Vegetais",
    description: "Alho descascado premium"
  },
  {
    id: 30,
    name: "Alho Frito 1kg",
    price: 22.90,
    image: "/assets/produtos/alho frito 1kl.heic",
    category: "Vegetais",
    description: "Alho frito crocante, pronto para usar"
  },

  // Ovos
  {
    id: 31,
    name: "Ovos de Codorna 700g",
    price: 15.90,
    image: "/assets/produtos/ovo de codorna 700g.heic",
    category: "Ovos",
    description: "Ovos de codorna frescos, ricos em proteínas"
  },
  {
    id: 32,
    name: "Ovos de Codorna",
    price: 13.90,
    image: "/assets/produtos/ovos de codorna.webp",
    category: "Ovos",
    description: "Ovos de codorna selecionados"
  },

  // Caldos
  {
    id: 33,
    name: "Caldo de Galinha Concentrado",
    price: 4.90,
    image: "/assets/produtos/caldo de galinha.heic",
    category: "Caldos",
    description: "Caldo de galinha concentrado para sopas e risotos"
  },

  // Ingredientes
  {
    id: 34,
    name: "Bicarbonato de Sódio",
    price: 3.90,
    image: "/assets/produtos/bicarbonato de sódio.heic",
    category: "Ingredientes",
    description: "Bicarbonato de sódio puro para diversos usos"
  },
  {
    id: 35,
    name: "Uvas Passas",
    price: 8.90,
    image: "/assets/produtos/uvas passas.heic",
    category: "Ingredientes",
    description: "Uvas passas doces para sobremesas e pratos especiais"
  },

  // Pratos Prontos
  {
    id: 36,
    name: "Bolinho de Bacalhau",
    price: 19.90,
    image: "/assets/produtos/bolinho de bacalhau.webp",
    category: "Pratos Prontos",
    description: "Bolinhos de bacalhau congelados, prontos para fritar"
  },
  {
    id: 37,
    name: "Carne Seca Premium",
    price: 65.90,
    image: "/assets/produtos/carne seca.webp",
    category: "Pratos Prontos",
    description: "Carne seca de primeira qualidade"
  }
];

export const categories = [
  "Todos", 
  "Temperos", 
  "Conservas", 
  "Carnes", 
  "Massas", 
  "Farinhas", 
  "Vegetais", 
  "Ovos", 
  "Caldos", 
  "Ingredientes", 
  "Pratos Prontos"
];
