import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { HomeIcon, SearchIcon, ArrowLeftIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Hamsoya Logo"
            width={100}
            height={100}
            className="rounded-full"
            priority
          />
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/products">
              <SearchIcon className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link
              href="/contact-us"
              className="text-primary hover:underline font-medium"
            >
              Contact us
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
