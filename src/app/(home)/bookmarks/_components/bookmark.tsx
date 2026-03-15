"use client";

import type { Product } from "@/types/product.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  GridIcon,
  HeartIcon,
  ListIcon,
  ShoppingBagIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";

const bookmarks: Product[] = [
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
];

export function Bookmark() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const clearBookmarks = () => {};

  const bookmarkCount = bookmarks.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              My Bookmarks
            </h1>

            <p className="text-muted-foreground">
              {bookmarkCount > 0
                ? `${bookmarkCount} saved products`
                : "No bookmarked products yet"}
            </p>
          </div>

          {bookmarkCount > 0 && (
            <div className="flex gap-2">
              {/* View toggle */}

              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                >
                  <GridIcon className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear bookmarks */}

              <Button
                size="lg"
                variant="outline"
                onClick={() => clearBookmarks()}
                className="text-destructive"
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {bookmarkCount > 0 && (
          <Badge variant="outline">
            <HeartIcon className="h-3 w-3 mr-1 fill-red-500" />
            {bookmarkCount} Bookmarked
          </Badge>
        )}
      </div>

      {/* Content */}

      {bookmarkCount === 0 ? (
        <Empty className="min-h-105 border-muted">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HeartIcon className="text-muted-foreground" />
            </EmptyMedia>

            <EmptyTitle>No bookmarks yet</EmptyTitle>

            <EmptyDescription>
              Start exploring our products and save your favorites to quickly
              find them later.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button asChild size="lg">
              <Link href="/products" prefetch>
                <ShoppingBagIcon className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              Tip: Click the ❤️ icon on any product to bookmark it
            </p>
          </EmptyContent>
        </Empty>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1",
          )}
        >
          {bookmarks.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className={viewMode === "list" ? "flex-row" : ""}
            />
          ))}
        </div>
      )}

      {/* CTA */}

      {bookmarkCount > 0 && (
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Ready to Order?</h3>

              <p className="text-sm text-muted-foreground mb-4">
                Add your bookmarked items to cart.
              </p>

              <Button asChild className="w-full">
                <Link href="/products" prefetch>
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
