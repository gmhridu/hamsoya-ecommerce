"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { BRAND_NAME } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

/* -----------------------------
   Validation Schema
--------------------------------*/

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPassword = () => {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    } as ForgotPasswordInput,

    validators: {
      onSubmit: ForgotPasswordSchema,
    },

    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Sending verification code...");

      try {
        /* -----------------------------
           Dummy API request
        --------------------------------*/

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("We’ve sent a verification code to your email.", {
          id: toastId,
        });

        router.replace(
          `/forgot-password/verify?email=${encodeURIComponent(value.email)}`,
        );
      } catch (error: any) {
        toast.error(error?.message ?? "Something went wrong.", {
          id: toastId,
        });
      }
    },
  });

  /* -----------------------------
     Field Error Component
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

          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>

          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a verification code to
            reset your password
          </p>
        </div>

        {/* Form Card */}

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Sign In
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
              {/* EMAIL FIELD */}

              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email Address
                    </label>

                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-10 h-11"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
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
                    disabled={state.isSubmitting}
                  >
                    {state.isSubmitting ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <MailIcon className="mr-2 size-4" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>

            {/* Help Text */}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
