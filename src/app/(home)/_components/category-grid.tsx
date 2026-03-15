import { CategoryCard } from "@/app/(home)/_components/category-card";

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

const categories: Category[] = [
  {
    id: "1",
    name: "Fresh Produce",
    description: "Organic fruits and vegetables",
    image: "/images/categories/fresh-produce.jpg",
    product_count: 42,
    slug: "fresh-produce",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    active_product_count: 38,
    featured_product_count: 5,
    days_since_created: 30,
  },
  {
    id: "2",
    name: "Pantry Staples",
    description: "Whole grains, legumes, and spices",
    image: "/images/categories/pantry-staples.jpg",
    product_count: 35,
    slug: "pantry-staples",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    active_product_count: 32,
    featured_product_count: 4,
    days_since_created: 25,
  },
  {
    id: "3",
    name: "Dairy & Eggs",
    description: "Fresh dairy products and eggs",
    image: "/images/categories/dairy-eggs.jpg",
    product_count: 28,
    slug: "dairy-eggs",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    active_product_count: 26,
    featured_product_count: 3,
    days_since_created: 20,
  },
  {
    id: "4",
    name: "Beverages",
    description: "Organic teas, juices, and coffee",
    image: "/images/categories/beverages.jpg",
    product_count: 30,
    slug: "beverages",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    active_product_count: 28,
    featured_product_count: 4,
    days_since_created: 15,
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of premium organic
            products, each category offering the finest quality and authentic
            taste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Featured Category Highlight */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/15 border border-primary/20 rounded-full shadow-sm hover:bg-primary/20 transition-colors duration-300">
            <span className="text-sm font-medium text-primary">
              ✨ All products are 100% organic and naturally sourced
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
