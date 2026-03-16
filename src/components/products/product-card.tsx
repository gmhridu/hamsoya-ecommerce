"use client";

import randomColor from "randomcolor";
import type { Product } from "@/types/product.type";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Price } from "../price";
import Link from "next/link";
import { useCart } from "@/lib/hooks/use-cart";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import { useCartStore } from "@/store/cart-store";
import { useBookmarkStore } from "@/store/bookmark-store";

interface ProductCardProps {
  product: Product;
  initialCartCount?: number;
  initialBookmarkCount?: number;
  className?: string;
}

export function ProductCard({
  product,
  initialCartCount = 0,
  initialBookmarkCount = 0,
  className,
}: ProductCardProps) {
  const isListView = className?.includes("flex-row");

  // temporary dummy values
  const hasDiscount = false;
  const discountPercentage = 0;

  // Get cart and bookmark hooks
  const { items: cartItems, addToCart, removeFromCart, updateCartQuantity } = useCart();
  const { toggleBookmark } = useBookmarks();

  // Get cart quantity for this product - use selector for proper reactivity
  // Use a proper selector for cart item to trigger re-renders
  const cartItem = useCartStore((state) => state.items.find(item => item.productId === product.id));
  const actualCartQuantity = cartItem?.quantity ?? 0;

  // Use a proper selector for bookmark to trigger re-renders
  const isProductBookmarked = useBookmarkStore((state) =>
    state.items.some((item) => item.productId === product.id)
  );

  // Use proper cart quantity
  const isProductInCart = actualCartQuantity > 0;

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleBookmark({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0],
      });
    } catch (error) {
      // Error is handled in the hook with rollback
    }
  };

  const handleAddToCart = async () => {
    if (!product.in_stock) return;

    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0],
      });
    } catch (error) {
      // Error is handled in the hook with rollback
    }
  };

  const handleIncrease = async () => {
    await updateCartQuantity(product.id, actualCartQuantity + 1);
  };

  const handleDecrease = async () => {
    if (actualCartQuantity <= 1) {
      await removeFromCart(product.id);
    } else {
      await updateCartQuantity(product.id, actualCartQuantity - 1);
    }
  };

  const tagColorMap = new Map<string, string>();

  const getTagColor = (tag: string) => {
    const key = tag.toLowerCase();

    if (!tagColorMap.has(key)) {
      tagColorMap.set(
        key,
        randomColor({
          luminosity: "bright",
          format: "rgb",
        }),
      );
    }

    return tagColorMap.get(key);
  };

  const getReadableTextColor = (rgb: string) => {
    const [r, g, b] = rgb
      .replace(/[^\d,]/g, "")
      .split(",")
      .map(Number);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000" : "#fff";
  };

  if (isListView) {
    return (
      <Card className="group overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg flex min-h-55">
        <Link href={product.id} className="flex w-full">
          {/* Image section */}
          <div className="relative overflow-hidden w-60 shrink-0 p-3">
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-50">
              <img
                src={product.images[0]}
                alt={product.name}
                sizes="240px"
                loading="lazy"
                className="object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {!product.in_stock && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-lg border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Out of Stock
                </Badge>
              )}
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-lg font-bold border-0 text-xs px-1.5 py-0.5 min-w-0 flex items-center justify-center"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {product.featured && (
                <Badge
                  variant="accent"
                  className="bg-accent text-white shadow-lg border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Featured
                </Badge>
              )}
            </div>

            {/* Bookmark button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleBookmark}
              className="
    absolute top-3 right-3
    bg-transparent
    hover:bg-transparent
    active:bg-transparent
    focus-visible:ring-0
    focus-visible:ring-offset-0
    shadow-none
    group
  "
            >
              <HeartIcon
                className={cn(
                  "size-5 transition-all duration-300",
                  isProductBookmarked
                    ? "fill-red-500 text-red-500 scale-110 animate-pop"
                    : "text-gray-600 group-hover:text-red-500"
                )}
              />
            </Button>
          </div>

          {/* Content section */}
          <div className="p-4 flex flex-1 flex-col justify-between min-h-0">
            <div className="flex-1 space-y-2">
              {/* Product name */}
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Tags with improved styling matching grid view */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 3).map((tag) => {
                    const bgColor = getTagColor(tag);
                    const textColor = getReadableTextColor(bgColor || "");

                    return (
                      <Badge
                        key={tag}
                        className="text-xs font-medium border-0 shadow-sm"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                        }}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Category & Origin badges */}
              <div className="flex flex-wrap gap-1">
                <Badge variant={"secondary"} className="text-xs px-2 py-0.5">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {product.origin}
                </Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      "size-3.5 transition-colors",
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-400 text-gray-400",
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                  (5.0)
                </span>
              </div>

              {/* Price */}
              <Price
                price={product.price}
                originalPrice={product.original_price}
                size="md"
              />
            </div>

            <div className="mt-4 space-y-2">
              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                {product.in_stock ? (
                  <>
                    <span className="text-green-600 font-medium">
                      ✓ In Stock
                    </span>
                    <span className="text-orange-600 font-medium">
                      Only {product.stock_quantity} left
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">
                    ✗ Out Of Stock
                  </span>
                )}
              </div>

              <div className="flex justify-start">
                {!isProductInCart ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="h-9 font-medium transition-all duration-300 text-sm px-6 cursor-pointer "
                  >
                    <ShoppingCartIcon className="mr-2 size-4" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button size="icon" onClick={handleDecrease}>
                      <MinusIcon className="size-3" />
                    </Button>
                    <span className="font-semibold">{actualCartQuantity}</span>
                    <Button size="icon" onClick={handleIncrease}>
                      <PlusIcon className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Grid view Layout (Original)
  return (
    <Card
      className={cn(
        "group overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg py-0 gap-0",
        className,
      )}
    >
      <Link href={product.id}>
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div className="relative h-88.75 max-h-full w-full">
              <img
                src={product.images[0]}
                alt={product.name}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Subtle overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/5 via-transparent to-transparent group-hover:from-black/10 transition-all duration-300" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {!product.in_stock && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-md border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Out of Stock
                </Badge>
              )}

              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-md font-bold border-0 text-xs px-1.5 py-0.5 min-w-0 flex items-center justify-center"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {product.featured && (
                <Badge
                  variant="accent"
                  className="bg-accent text-white shadow-md border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Featured
                </Badge>
              )}
            </div>
            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleBookmark}
              className="
    absolute top-3 right-3
    bg-transparent
    hover:bg-transparent
    active:bg-transparent
    focus-visible:ring-0
    focus-visible:ring-offset-0
    shadow-none
    group
  "
            >
              <HeartIcon
                className={cn(
                  "size-5 transition-all duration-300",
                  isProductBookmarked
                    ? "fill-red-500 text-red-500 scale-110 animate-pop"
                    : "text-gray-600 group-hover:text-red-500"
                )}
              />
            </Button>
          </div>

          <div className="p-4 pb-3">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Tags with improved styling */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {product.tags.slice(0, 2).map((tag) => {
                  // Determine badge variant based on tag content
                  const getTagVariant = (tagName: string) => {
                    const lowerTag = tagName.toLowerCase();
                    if (
                      lowerTag.includes("organic") ||
                      lowerTag.includes("natural")
                    ) {
                      return "success";
                    }
                    if (
                      lowerTag.includes("premium") ||
                      lowerTag.includes("traditional")
                    ) {
                      return "accent";
                    }
                    if (
                      lowerTag.includes("spicy") ||
                      lowerTag.includes("hot")
                    ) {
                      return "warning";
                    }
                    return "default";
                  };

                  return (
                    <Badge
                      key={tag}
                      variant={getTagVariant(tag)}
                      className="text-xs font-medium border-0 shadow-sm"
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Rating with improved styling */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600",
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                (4.0)
              </span>
            </div>

            <Price
              price={product.price}
              originalPrice={product.original_price}
              size="md"
              className="mb-3"
            />

            {/* Additional Product Information */}
            <div className="space-y-2">
              {/* Weight/Size Information */}
              {product.weight && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Size:</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-700">
                    {product.weight}
                  </span>
                </div>
              )}

              {/* Origin Information */}
              {product.origin && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Origin:</span>
                  <span className="text-gray-700">{product.origin}</span>
                </div>
              )}

              {/* Stock Status with simulated quantity */}
              <div className="flex items-center gap-2 text-xs">
                {product.in_stock ? (
                  <>
                    <span className="text-green-600 font-medium">
                      ✓ In Stock
                    </span>
                    <span className="text-orange-600 font-medium">
                      Only {product.stock_quantity} left
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">
                    ✗ Out Of Stock
                  </span>
                )}
              </div>

              {/* Key Benefit Highlight */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Key Benefit:</span>
                  <span className="ml-1 text-gray-700">
                    {product.benefits[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-1">
        {!isProductInCart ? (
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-full h-10 font-medium transition-all duration-300"
          >
            <ShoppingCartIcon className="mr-2 size-4" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            <Button size="icon" onClick={handleDecrease}>
              <MinusIcon className="size-3" />
            </Button>
            <span className="font-semibold text-lg">{actualCartQuantity}</span>
            <Button size="icon" onClick={handleIncrease}>
              <PlusIcon className="size-3" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
