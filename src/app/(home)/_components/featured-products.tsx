

import Link from "next/link";
import type { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";

import { ArrowRightIcon } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Organic Honey",
    description: "Pure, unfiltered honey from local beekeepers",
    price: 12.99,
    original_price: null,
    images: ["/images/honey.jpg"],
    in_stock: true,
    category: "Honey",
    rating: 4.8,
    reviews: 120,
    tags: ["organic", "local", "natural"],
    weight: "500g",
    origin: "Local",
    benefits: ["Natural", "Organic", "Rich in antioxidants"],
    stock_quantity: 50,
    variants: [
      { id: "1-1", name: "Small Jar", price: 12.99, in_stock: true },
      { id: "1-2", name: "Medium Jar", price: 19.99, in_stock: true },
      { id: "1-3", name: "Large Jar", price: 24.99, in_stock: true },
    ],
  },
  {
    id: "2",
    name: "Artisan Bread",
    description: "Freshly baked daily with traditional recipes",
    price: 4.5,
    original_price: 5.0,
    discount: 0.1,
    images: ["/images/bread.jpg"],
    in_stock: true,
    category: "Bakery",
    rating: 4.5,
    reviews: 85,
    tags: ["organic", "gluten-free", "vegan"],
    weight: "400g",
    origin: "Local Bakery",
    benefits: ["Fresh", "Handmade", "No preservatives"],
    stock_quantity: 30,
    variants: [
      { id: "2-1", name: "Whole Wheat", price: 4.5, in_stock: true },
      { id: "2-2", name: "Multigrain", price: 5.5, in_stock: true },
      { id: "2-3", name: "Sourdough", price: 6.0, in_stock: true },
    ],
  },
  {
    id: "3",
    name: "Fresh Apples",
    description: "Crisp, juicy apples from local orchards",
    price: 3.99,
    original_price: null,
    images: ["/images/apples.jpg"],
    in_stock: true,
    category: "Produce",
    rating: 4.7,
    reviews: 95,
    tags: ["organic", "local", "fresh"],
    weight: "1kg",
    origin: "Local Farm",
    benefits: ["Fresh", "Organic", "Rich in fiber"],
    stock_quantity: 40,
    variants: [
      { id: "3-1", name: "Red Delicious", price: 3.99, in_stock: true },
      { id: "3-2", name: "Fuji", price: 4.5, in_stock: true },
      { id: "3-3", name: "Gala", price: 4.2, in_stock: true },
    ],
  },
  {
    id: "4",
    name: "Organic Milk",
    description: "Fresh, organic milk from grass-fed cows",
    price: 3.49,
    original_price: null,
    images: ["/images/milk.jpg"],
    in_stock: true,
    category: "Dairy",
    rating: 4.8,
    reviews: 120,
    tags: ["organic", "grass-fed", "fresh"],
    weight: "1L",
    origin: "Local Dairy",
    benefits: ["Organic", "Grass-fed", "Rich in vitamins"],
    stock_quantity: 50,
    variants: [
      { id: "4-1", name: "Whole Milk", price: 3.49, in_stock: true },
      { id: "4-2", name: "Skim Milk", price: 3.29, in_stock: true },
      { id: "4-3", name: "Almond Milk", price: 3.99, in_stock: true },
      { id: "4-4", name: "Oat Milk", price: 3.79, in_stock: true },
    ],
  },
];

export function FeaturedProducts() {
  const bookmarkCount = 2;
  const cartCount = 5;
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Handpicked premium products that represent the best of our
              collection. Each item is carefully selected for its exceptional
              quality and authentic taste.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/products">
              View All Products
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              initialBookmarkCount={bookmarkCount}
              initialCartCount={cartCount}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-linear-to-r from-primary to-accent p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-serif font-bold mb-2">
              Pre-Order Your Favorites
            </h3>
            <p className="text-primary-foreground/90 mb-6 max-w-md mx-auto">
              Secure your order today and enjoy fresh, premium quality products
              delivered right to your doorstep with cash on delivery.
            </p>

            <Button asChild size="lg" variant="secondary">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
