import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AwardIcon,
  ClockIcon,
  HeartIcon,
  LeafIcon,
  ShieldIcon,
  TruckIcon,
} from "lucide-react";

const uspItems = [
  {
    icon: LeafIcon,
    title: "100% Organic",
    description:
      "All our products are certified organic and naturally sourced from trusted farmers.",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: TruckIcon,
    title: "Free Delivery",
    description:
      "Enjoy free home delivery across Bangladesh with our reliable logistics network.",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: ShieldIcon,
    title: "Quality Assured",
    description:
      "Every product undergoes strict quality checks to ensure premium standards.",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    icon: ClockIcon,
    title: "Fresh Daily",
    description:
      "Products are processed and packed fresh daily to maintain optimal quality.",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  {
    icon: AwardIcon,
    title: "Premium Grade",
    description:
      "We source only the finest grade products that meet international standards.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    icon: HeartIcon,
    title: "Family Trusted",
    description:
      "Trusted by thousands of families across Bangladesh for authentic taste.",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
];

export const UPSHighlights = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Why Choose Hamsoya?
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At Hamsoya, we are committed to providing our customers with the
            best possible products and services. Our team of experienced
            professionals is always ready to assist you with any questions or
            concerns you may have.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uspItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300",
                      item.bgColor,
                    )}
                  >
                    <Icon className={cn("size-8", item.color)} />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">
              🌟 Join 10,000+ satisfied customers who trust Hamsoya
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
