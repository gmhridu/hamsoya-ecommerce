import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartTriggerProps {
  count: number;
}

export const CartTrigger = ({ count }: CartTriggerProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-accent cursor-pointer"
    >
      <ShoppingBagIcon className="size-5 cursor-pointer" />
      <Badge
        variant="destructive"
        className="absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-4 min-h-4 text-center"
        suppressHydrationWarning
      >
        {count || 0}
      </Badge>
    </Button>
  );
};
