"use client";

import  Link  from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    title: "Pure Kalo Jira Flowers Honey",
    subtitle: "Natural & Organic",
    description:
      "Experience the authentic taste of pure honey collected from Kalo Jira flowers. Rich in antioxidants and natural healing properties.",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=80",
    cta: "Shop Now",
    href: "/products/kalo-jira-flowers-honey",
    badge: "Best Seller",
  },
  {
    id: 2,
    title: "Traditional Desi Ghee",
    subtitle: "Farm Fresh Quality",
    description:
      "Premium clarified butter made from grass-fed cow milk. Perfect for cooking and traditional Ayurvedic remedies.",
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1600&auto=format&fit=crop&q=80",
    cta: "Discover",
    href: "/products/pure-ghee",
    badge: "Premium",
  },
  {
    id: 3,
    title: "Authentic Bengali Spices",
    subtitle: "Fresh Ground Daily",
    description:
      "Freshly ground spices with authentic taste and aroma. Perfect for traditional Bengali cuisine.",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80",
    cta: "Explore",
    href: "/products?category=spices",
    badge: "Fresh",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );

    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      // minimum swipe distance
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section
      className="relative h-125 md:h-160 overflow-hidden bg-linear-to-br from-primary/10 to-accent/10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with smooth crossfade */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.85] transition-transform duration-[12s]"
            loading={index === 0 ? "eager" : "lazy"}
            style={{
              transform: index === currentSlide ? "scale(1.05)" : "scale(1)",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "transition-all duration-1000",
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8",
              )}
            >
              {index === currentSlide && (
                <>
                  <Badge variant="secondary" className="mb-4">
                    {slide.badge}
                  </Badge>

                  <p className="text-sm font-medium text-primary-foreground/80 mb-2">
                    {slide.subtitle}
                  </p>

                  <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                    >
                      <Link href={slide.href}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {slide.cta}
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-2 border-white/60 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all"
                    >
                      <Link href="/products">View All Products</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Better positioning & visibility */}
      <div className="absolute inset-0 z-20 hidden md:flex items-center justify-between pointer-events-none px-4 lg:px-8 cursor-pointer">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-12 w-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 cursor-pointer" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-12 w-12 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 cursor-pointer" />
        </Button>
      </div>

      {/* Mobile arrows (smaller) */}
      <div className="md:hidden absolute inset-0 z-20 flex items-center justify-between pointer-events-none px-4 cursor-pointer">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-10 w-10 rounded-full bg-black/40 text-white/90 cursor-pointer"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5 cursor-pointer" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-10 w-10 rounded-full bg-black/40 text-white/90 cursor-pointer"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5 cursor-pointer" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-500",
              index === currentSlide
                ? "bg-white scale-125 shadow-lg shadow-white/40"
                : "bg-white/50 hover:bg-white/80",
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
