'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Hamsoya Logo"
            width={80}
            height={80}
            className="rounded-full"
            priority
          />
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertTriangleIcon className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or contact support
            if the problem persists.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link
              href="/contact-us"
              className="text-primary hover:underline font-medium"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
