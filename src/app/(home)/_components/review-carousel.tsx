"use client";

import type { Review } from "@/types/reviews.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  QuoteIcon,
  StarIcon,
  VerifiedIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export const mockReviews: Review[] = [
  {
    id: "1",
    productId: "kalo-jira-flowers-honey",
    userName: "Fatima Rahman",
    rating: 5,
    comment:
      "Excellent quality honey! The taste is amazing and you can feel the natural purity.",
    createdAt: "2024-01-15",
    verified: true,
  },
  {
    id: "2",
    productId: "pure-ghee",
    userName: "Mohammad Ali",
    rating: 5,
    comment:
      "Best ghee I have ever used. The aroma and taste remind me of my grandmother's homemade ghee.",
    createdAt: "2024-01-10",
    verified: true,
  },
  {
    id: "3",
    productId: "green-chili-powder",
    userName: "Rashida Begum",
    rating: 4,
    comment: "Very fresh and spicy. Perfect for our traditional cooking.",
    createdAt: "2024-01-08",
    verified: true,
  },
];

const extendedReviews = [
  ...mockReviews,
  {
    id: "4",
    productId: "laccha-shemai",
    userName: "Nasir Ahmed",
    rating: 5,
    comment:
      "The laccha shemai is absolutely perfect for making traditional desserts. My family loved it!",
    createdAt: "2024-01-05",
    verified: true,
  },
  {
    id: "5",
    productId: "mustard-oil",
    userName: "Salma Khatun",
    rating: 4,
    comment:
      "Great quality mustard oil with authentic taste. Perfect for Bengali cooking.",
    createdAt: "2024-01-03",
    verified: true,
  },
  {
    id: "6",
    productId: "kalo-jira-flowers-honey",
    userName: "Dr. Rahman",
    rating: 5,
    comment:
      "As a doctor, I can confirm this honey has excellent medicinal properties. Highly recommended!",
    createdAt: "2024-01-01",
    verified: true,
  },
];

export const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(
        (prev) =>
          (prev + 1) % Math.max(1, extendedReviews.length - itemsPerView + 1),
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [itemsPerView]);

  const maxIndex = Math.max(0, extendedReviews.length - itemsPerView);

  const next = () => setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));
  const prev = () => setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1));

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real reviews from satisfied customers who trust our quality.
          </p>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative">
          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView)
                }%)`,
              }}
            >
              {extendedReviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    "px-3 shrink-0",
                    itemsPerView === 1 && "basis-full",
                    itemsPerView === 2 && "basis-1/2",
                    itemsPerView === 3 && "basis-1/3",
                  )}
                >
                  {/* CARD */}
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote */}
                      <QuoteIcon className="h-8 w-8 text-primary/20 mb-4" />

                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200 fill-gray-200",
                            )}
                          />
                        ))}
                      </div>

                      {/* Text */}
                      <p className="text-muted-foreground mb-6 leading-relaxed grow">
                        “{review.comment}”
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(review.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {review.userName}
                            </span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <VerifiedIcon className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto -translate-x-4 bg-background"
              onClick={prev}
            >
              <ChevronLeftIcon />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto translate-x-4 bg-background"
              onClick={next}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
