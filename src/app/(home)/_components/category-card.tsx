"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

// Define the category type based on the router response
interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  product_count: number;
  slug: string;
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date;
  active_product_count: number;
  featured_product_count: number;
  days_since_created: number;
}

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/products?category=${category.id}`} className="group">
      <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <div className="relative h-48 overflow-hidden rounded-xl">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}

          {/* Base gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

          {/* Hover overlay for better text readability */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

          {/* Product Count Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-primary/90 text-white border-0 shadow-md hover:bg-primary transition-colors duration-300"
          >
            {category.product_count} items
          </Badge>

          {/* Category Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-semibold mb-1 group-hover:text-accent transition-colors duration-300">
              {category.name}
            </h3>
            <p className="text-sm text-white/90 group-hover:text-white mb-3 transition-colors duration-300">
              {category.description || "Explore our premium selection"}
            </p>

            <div className="flex items-center text-sm font-medium group-hover:text-accent transition-all duration-300">
              <span>Shop Now</span>
              <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
