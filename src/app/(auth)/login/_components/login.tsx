"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { BRAND_NAME } from "@/lib/constants";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";

import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

/* -----------------------------
   Validation Schemas
--------------------------------*/

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const RegisterSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phone_number: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginInput = z.infer<typeof LoginSchema>;
type RegisterInput = z.infer<typeof RegisterSchema>;

export const Login = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* -----------------------------
     LOGIN FORM
  --------------------------------*/

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginInput,

    validators: {
      onSubmit: LoginSchema,
    },

    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Signing in...");

      try {
        await new Promise((r) => setTimeout(r, 1200));

        toast.success("Login successful 🎉", {
          id: toastId,
        });

        router.replace("/");
      } catch (error: any) {
        toast.error("Login failed", {
          id: toastId,
          description: error?.message ?? "Invalid email or password",
        });
      }
    },
  });

  /* -----------------------------
     REGISTER FORM
  --------------------------------*/

  const registerForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
    } as RegisterInput,

    validators: {
      onSubmit: RegisterSchema,
    },

    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Creating account...");

      try {
        await new Promise((r) => setTimeout(r, 1500));

        toast.success("Account created 🎉", {
          id: toastId,
        });

        router.replace(
          `/verify-email?email=${encodeURIComponent(value.email)}`,
        );
      } catch (error: any) {
        toast.error("Registration failed", {
          id: toastId,
          description: error?.message,
        });
      }
    },
  });

  /* -----------------------------
     FIELD ERROR COMPONENT
  --------------------------------*/

  const FieldError = ({ field }: any) => {
    if (!field.state.meta.isTouched) return null;
    if (!field.state.meta.errors.length) return null;

    return (
      <p className="text-sm text-destructive">
        {field.state.meta.errors[0]?.message}
      </p>
    );
  };

  /* -----------------------------
     UI
  --------------------------------*/

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Image
          src="/logo.png"
          alt="logo"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h1 className="text-3xl font-bold">{BRAND_NAME}</h1>
        <p className="text-muted-foreground">
          Premium Organic Food & Everyday Essentials
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <Card className="shadow-lg border-0">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-center">Welcome</h2>
          </CardHeader>

          <CardContent>
            <TabsList className="grid grid-cols-2 w-full h-11">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN */}

            <TabsContent value="login" className="mt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loginForm.handleSubmit();
                }}
                className="space-y-5"
              >
                <loginForm.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <label>Email</label>

                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                        <Input
                          className="pl-10"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>

                      <FieldError field={field} />
                    </div>
                  )}
                </loginForm.Field>

                <loginForm.Field name="password">
                  {(field) => (
                    <div className="space-y-2">
                      <label>Password</label>

                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="pl-10"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOffIcon size={16} />
                          ) : (
                            <EyeIcon size={16} />
                          )}
                        </button>
                      </div>

                      <FieldError field={field} />
                    </div>
                  )}
                </loginForm.Field>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* REGISTER */}

            <TabsContent value="signup" className="mt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  registerForm.handleSubmit();
                }}
                className="space-y-5"
              >
                <registerForm.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <label>Full Name</label>

                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                        <Input
                          className="pl-10"
                          placeholder="John Doe"
                          type="text"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>

                      <FieldError field={field} />
                    </div>
                  )}
                </registerForm.Field>

                <registerForm.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <label>Email</label>

                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                        <Input
                          className="pl-10"
                          type="email"
                          placeholder="john@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>

                      <FieldError field={field} />
                    </div>
                  )}
                </registerForm.Field>

                <registerForm.Field name="password">
                  {(field) => (
                    <div className="space-y-2">
                      <label>Password</label>

                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="********"
                          className="pl-10"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOffIcon size={16} />
                          ) : (
                            <EyeIcon size={16} />
                          )}
                        </button>
                      </div>

                      <FieldError field={field} />
                    </div>
                  )}
                </registerForm.Field>

                <Button type="submit" className="w-full">
                  Create Account
                </Button>

                <Separator />

                <p className="text-xs text-center text-muted-foreground">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="text-primary">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};
