"use client";

import z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import { BRAND_NAME } from "@/lib/constants";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useResetPassword } from "@/lib/trpc/hooks";

/* -----------------------------
   Validation Schema
--------------------------------*/

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must include uppercase, lowercase and number",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    } as ResetPasswordInput,

    validators: {
      onSubmit: ResetPasswordSchema,
    },

    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Resetting password...");

      try {
        await resetPasswordMutation.mutateAsync({
          token: token,
          password: value.password,
        });

        toast.success("Password reset successfully", {
          id: toastId,
        });

        router.push("/login?reset=true");
      } catch (error: any) {
        toast.error(error?.message ?? "Something went wrong", {
          id: toastId,
        });
      }
    },
  });

  /* -----------------------------
     Field Error Component
  --------------------------------*/

  const FieldError = ({ field }: { field: any }) => {
    if (!field.state.meta.isTouched) return null;
    if (!field.state.meta.errors.length) return null;

    return (
      <p className="text-sm text-destructive">
        {field.state.meta.errors[0]?.message}
      </p>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-linear-to-r from-primary to-accent" />
            <span className="font-serif text-2xl font-bold text-primary">
              {BRAND_NAME}
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>

          <p className="text-muted-foreground mt-2">
            Enter a new password for your account
          </p>
        </div>

        {/* Card */}

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <Link
              href={`/forgot-password/verify?email=${encodeURIComponent(
                email,
              )}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </Link>
          </CardHeader>

          <CardContent className="pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              {/* PASSWORD */}

              <form.Field name="password">
                {(field: any) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>

                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pl-10 pr-10 h-11"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <FieldError field={field} />
                  </div>
                )}
              </form.Field>

              {/* CONFIRM PASSWORD */}

              <form.Field name="confirmPassword">
                {(field: any) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 h-11"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <FieldError field={field} />
                  </div>
                )}
              </form.Field>

              {/* SUBMIT BUTTON */}

              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                })}
              >
                {(state) => (
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={state.isSubmitting || resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <LockIcon className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>

            {/* Help Text */}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters with uppercase,
                lowercase, and number
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
