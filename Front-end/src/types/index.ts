export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  isOnSale?: boolean;
  discount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
