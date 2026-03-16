"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Badge,
  HeartIcon,
  LogInIcon,
  LogOutIcon,
  Menu,
  SettingsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchForm } from "@/components/shared/search-form";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logout } from "@/components/logout/logout";

interface HeaderProps {
  bookmarkCount: number;
  cartCount: number;
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
  userImage?: string;
  userRole?: string;
}

export function Header({
  bookmarkCount,
  cartCount,
  isAuthenticated,
  userName,
  userEmail,
  userImage,
  userRole,
}: HeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const BRAND_NAME = "Hamsoya";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                width={20}
                height={20}
                alt={BRAND_NAME}
                className="size-8"
              />
            </div>
            <span className="hidden sm:inline-block font-serif text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                  "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md">
            <SearchForm className="" searchRef={searchRef} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist - Hidden on mobile */}
            <BookmarkButton bookmarkCount={bookmarkCount} />

            {/* Cart */}
            <CartDrawer cartCount={cartCount} />

            {/* Theme Toggle - Desktop only */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Theme Toggle - Tablet */}
            <div className="hidden md:block lg:hidden">
              <ThemeToggle />
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  {isAuthenticated && userName ? (
                    <Button
                      variant="ghost"
                      className="relative size-9 rounded-full p-0 hover:bg-primary/10"
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={userImage ?? undefined}
                          alt={userName ?? "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {userName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 hover:bg-primary/10"
                    >
                      <UserIcon className="size-5" />
                    </Button>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm"
                >
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1 px-1 py-1">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {userName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {userRole === "ADMIN" && (
                        <DropdownMenuItem className="cursor-pointer">
                          <ShieldIcon className="mr-2 size-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        {/* Profile route */}
                        <Link href="/" className="cursor-pointer">
                          <UserIcon className="mr-2 size-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        {/* Orders route */}
                        <Link href="/" className="cursor-pointer">
                          <ShoppingBagIcon className="mr-2 h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        {/* Settings route */}
                        <Link href="/" className="cursor-pointer">
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        // onClick={handleLogout}
                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/20"
                      >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        {/* Login route */}
                        <Link href="/login" className="cursor-pointer">
                          <LogInIcon className="mr-2 size-4" />
                          <span>Login / Register</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md p-0 overflow-y-auto"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <Link
                      href="/"
                      className="flex items-center space-x-2 shrink-0"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src="/logo.png"
                          width={20}
                          height={20}
                          alt={BRAND_NAME}
                          className="size-8"
                        />
                      </div>
                      <span className="font-serif text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {BRAND_NAME}
                      </span>
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Mobile Search */}
                    <div className="p-6 border-b" ref={searchRef}>
                      <SearchForm searchRef={searchRef} />
                    </div>

                    {/* User Profile Section - Mobile */}
                    {isAuthenticated && (
                      <div className="p-6 border-b bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                            <AvatarImage
                              src={userImage ?? undefined}
                              alt={userName ?? "User"}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-base">
                              {userName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {userName}
                            </p>
                            <p className="text-xs truncate text-muted-foreground">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Navigation Links */}
                    <nav className="p-4 space-y-1">
                      {NAVIGATION_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                            "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile User Actions */}
                    <div className="p-4 space-y-1 border-t">
                      {isAuthenticated ? (
                        <>
                          {userRole === "ADMIN" && (
                            <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10 text-left">
                              <ShieldIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                              Admin Dashboard
                            </button>
                          )}

                          {/* Profile route*/}
                          <Link
                            href="/"
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10"
                          >
                            <UserIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                            Profile
                          </Link>
                          {/* Orders route */}
                          <Link
                            href="/"
                            className="flex items-center p-8 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10"
                          >
                            <ShoppingBagIcon className="mr-3 size-5 text-muted-foreground" />
                            My Orders
                          </Link>

                          {/* Settings route */}
                          <Link
                            href="/"
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10"
                          >
                            <SettingsIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                            Settings
                          </Link>

                          {/* Bookmarks route */}
                          <Link
                            href="/"
                            className="flex items-center p-8 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10"
                          >
                            <HeartIcon className="mr-3 size-5 text-muted-foreground" />
                            <span>Bookmarks</span>
                            <Badge className="ml-auto h-5 px-2 text-xs">
                              {bookmarkCount}
                            </Badge>
                          </Link>
                        </>
                      ) : (
                        // Login route
                        <Link
                          href="/login"
                          className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-primary/10"
                        >
                          <LogInIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                          Login / Register
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-6 border-t bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>

                    {isAuthenticated && <Logout />}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
