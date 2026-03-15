import * as z from "zod";
import { useEffect, useState, type RefObject } from "react";
import { useForm } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { SearchIcon } from "lucide-react";

const searchSchema = z.object({
  search: z.string().min(1),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  className?: string;
  searchRef: RefObject<HTMLInputElement | null>;
}

/* ---------------- Debounce Hook ---------------- */

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* ---------------- Dummy Data ---------------- */

const dummySuggestions = {
  categories: [
    { id: "1", name: "Electronics" },
    { id: "2", name: "Shoes" },
  ],
  products: [
    { id: "1", name: "iPhone 15 Pro" },
    { id: "2", name: "Nike Air Max" },
  ],
};

/* ---------------- Component ---------------- */

export function SearchForm({ className, searchRef }: SearchFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsData] = useState(dummySuggestions);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebouncedValue(searchValue, 400);

  const form = useForm({
    defaultValues: {
      search: "",
    } as SearchFormValues,

    onSubmit: ({ value }) => {
      console.log("Searching:", value.search);
    },
  });

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  /* ---------------- Handlers ---------------- */

  const handleFocus = () => {
    if (debouncedSearch.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleCategoryClick = (cat: any) => {
    console.log("Category:", cat);
    setShowSuggestions(false);
  };

  const handleProductClick = (prod: any) => {
    console.log("Product:", prod);
    setShowSuggestions(false);
  };

  /* ---------------- Render ---------------- */

  return (
    <div className={cn("relative w-full", className)} ref={searchRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="search">
          {(field) => (
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

              <Input
                type="search"
                placeholder="Search products, categories..."
                value={field.state.value}
                onFocus={handleFocus}
                onChange={(e) => {
                  const value = e.target.value;
                  field.handleChange(value);
                  setSearchValue(value);
                }}
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors"
              />
            </div>
          )}
        </form.Field>
      </form>

      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-background border border-border/60 rounded-xl shadow-xl max-h-80 overflow-hidden">
          {(suggestionsData.categories.length > 0 ||
            suggestionsData.products.length > 0) && (
            <div className="divide-y divide-border/50">
              {/* Categories */}
              {suggestionsData.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                    Categories
                  </div>

                  <ul>
                    {suggestionsData.categories.map((cat) => (
                      <li
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className="px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors"
                      >
                        <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Products */}
              {suggestionsData.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                    Products
                  </div>

                  <ul>
                    {suggestionsData.products.map((prod) => (
                      <li
                        key={prod.id}
                        onClick={() => handleProductClick(prod)}
                        className="px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors"
                      >
                        <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{prod.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
