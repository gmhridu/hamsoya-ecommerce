import { HeroSection } from "@/app/(home)/_components/hero-section";
import { CategoryGrid } from "@/app/(home)/_components/category-grid";
import { FeaturedProducts } from "@/app/(home)/_components/featured-products";
import { UPSHighlights } from "@/app/(home)/_components/ups-highlights";
import { PreOrderGuide } from "@/app/(home)/_components/pre-order-guide";
import { ReviewsCarousel } from "@/app/(home)/_components/review-carousel";

export default function Homepage() {
  return (
    <main>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <UPSHighlights />
      <PreOrderGuide />
      <ReviewsCarousel />
    </main>
  );
}
