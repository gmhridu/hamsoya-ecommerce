import type { Product } from "./product.type";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartType {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface BookmarkType {
  productId: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}
