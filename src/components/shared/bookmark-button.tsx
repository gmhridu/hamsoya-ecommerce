import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInitialUser } from "@/lib/auth/auth-provider";

interface BookmarkButtonProps {
  bookmarkCount: number;
}

export function BookmarkButton({ bookmarkCount }: BookmarkButtonProps) {
  const { user } = useInitialUser();
  const isAuthenticated = !!user;
  const router = useRouter();
  const totalBookmarks = bookmarkCount;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      router.push("/login");
      return;
    }
    // Let the Link handle navigation if authenticated
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-primary/10 hidden sm:flex cursor-pointer"
      asChild
    >
      <Link href={isAuthenticated ? "/bookmarks" : "#"} onClick={handleClick}>
        <HeartIcon className="size-5" />
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-4 min-h-4 text-center"
          suppressHydrationWarning
        >
          {totalBookmarks}
        </Badge>
      </Link>
    </Button>
  );
}
