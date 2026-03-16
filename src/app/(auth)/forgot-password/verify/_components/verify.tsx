"use client";

import z from "zod";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { ArrowLeftIcon, MailIcon, RefreshCwIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";

/* -----------------------------
   Schema
--------------------------------*/

const verifyForgetPasswordOTPSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

type VerifyForgetPasswordOTPFormData = z.infer<
  typeof verifyForgetPasswordOTPSchema
>;

const COOLDOWN_SECONDS = 60;

export const Verify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  /* -----------------------------
     Redirect if no email
  --------------------------------*/

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  /* -----------------------------
     Cooldown Timer
  --------------------------------*/

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* -----------------------------
     Form
  --------------------------------*/

  const form = useForm({
    defaultValues: {
      otp: "",
    } as VerifyForgetPasswordOTPFormData,

    validators: {
      onSubmit: verifyForgetPasswordOTPSchema,
    },

    onSubmit: async ({ value }) => {
      setOtpError(null);

      const toastId = toast.loading("Verifying code...");

      try {
        /* -----------------------------
           Dummy verification
        --------------------------------*/

        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (value.otp !== "123456") {
          throw new Error("Invalid or expired code");
        }

        toast.success("Code verified", { id: toastId });

        router.push(
          `/forgot-password/reset?email=${encodeURIComponent(email!)}`,
        );
      } catch (error: any) {
        setOtpError(error.message);
        toast.error(error.message, { id: toastId });
      }
    },
  });

  /* -----------------------------
     Resend Handler
  --------------------------------*/

  const handleResend = async () => {
    const toastId = toast.loading("Sending code...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResendCooldown(COOLDOWN_SECONDS);
      setOtpError(null);

      form.reset();

      toast.success("Verification code sent", { id: toastId });
    } catch {
      toast.error("Failed to resend code", { id: toastId });
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          {/* Header */}

          <div className="text-center space-y-2">
            <MailIcon className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Verify your email</h1>

            <p className="text-sm text-muted-foreground">
              We've sent a verification code to {email}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* OTP FIELD */}

            <form.Field name="otp">
              {(field) => (
                <div className="space-y-3">
                  <label className="text-sm text-center block font-medium">
                    Verification code
                  </label>

                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      autoFocus
                      inputMode="numeric"
                      value={field.state.value}
                      onChange={(v) => {
                        field.handleChange(v);
                        setOtpError(null);
                      }}
                    >
                      <InputOTPGroup className="gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className={`
                              h-11 w-11 rounded-md text-lg font-medium
                              bg-background border
                              transition-all duration-150
                              ${
                                otpError
                                  ? "border-destructive"
                                  : "border-input hover:border-primary"
                              }
                            `}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Zod Errors */}

                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive text-center">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}

                  {/* Server Errors */}

                  {otpError && (
                    <p className="text-sm text-destructive text-center">
                      {otpError}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* VERIFY BUTTON */}

            <form.Subscribe
              selector={(state) => ({
                isSubmitting: state.isSubmitting,
                otp: state.values.otp,
              })}
            >
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={state.isSubmitting || state.otp.length !== 6}
                >
                  {state.isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              )}
            </form.Subscribe>

            {/* Resend */}

            {resendCooldown > 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                You can resend the code in{" "}
                <span className="font-medium">{resendCooldown}s</span>
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                className="w-full gap-2"
              >
                <RefreshCwIcon className="h-4 w-4" />
                Resend verification code
              </Button>
            )}

            {/* Back */}

            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to forgot password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}

      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@hamsoya.com"
            className="text-primary hover:underline"
          >
            support@hamsoya.com
          </a>
        </p>
      </div>
    </div>
  );
};
