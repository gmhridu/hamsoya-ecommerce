export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  in_stock: boolean;
  featured?: boolean;
  tags: string[] | null;
  weight: string | null;
  origin: string | null;
  benefits: string[] | null;
  rating?: number;
  reviews?: number;
  stock_quantity: number;
  allowPreorder?: boolean;
  variants?: ProductVariant[];
  discount?: number;
};
