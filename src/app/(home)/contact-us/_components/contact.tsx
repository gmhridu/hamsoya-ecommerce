"use client";

import { useState } from "react";
import {

  SendIcon,
  MessageCircleIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
} from "lucide-react";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {  COMPANY_INFO } from "@/lib/constants";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;


const contactInfo = [
  {
    icon: PhoneIcon,
    title: "Phone",
    details: COMPANY_INFO.phone,
    description: "Call us for immediate assistance",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: MailIcon,
    title: "Email",
    details: COMPANY_INFO.email,
    description: "Send us an email anytime",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: MapPinIcon,
    title: "Address",
    details: COMPANY_INFO.address,
    description: "Visit our office",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    icon: ClockIcon,
    title: "Business Hours",
    details: "Sat - Thu: 9:00 AM - 6:00 PM",
    description: "Friday: Closed",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
];

const subjects = [
  "General Inquiry",
  "Product Information",
  "Order Support",
  "Delivery Issue",
  "Quality Concern",
  "Partnership",
  "Other",
];

/* -----------------------------
   Component
--------------------------------*/

export function ContactUsClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    } as ContactFormData,

    validators: {
      onChange: contactSchema,
    },

    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        // simulate API request
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Form Data:", value);

        toast.success("Message sent successfully! We'll get back to you soon.");
        form.reset();
      } catch (error) {
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative py-20 bg-linear-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="outline" className="mb-6">
            Contact Us
          </Badge>

          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Get in Touch
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Have questions about our products or need assistance? We're here to
            help and would love to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              How to Reach Us
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to connect with our team for support, inquiries, or
              feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;

              return (
                <Card
                  key={index}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow text-center"
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${info.bgColor} mb-4`}
                    >
                      <Icon className={`h-8 w-8 ${info.color}`} />
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{info.title}</h3>

                    <p className="font-medium mb-1">{info.details}</p>

                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleIcon className="h-5 w-5" />
                Send us a Message
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                {/* NAME */}
                <form.Field name="name">
                  {(field) => (
                    <div>
                      <Label>Full Name *</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your full name"
                      />

                      {field.state.meta.errors?.[0]?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* EMAIL */}
                <form.Field name="email">
                  {(field) => (
                    <div>
                      <Label>Email Address *</Label>

                      <Input
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your email"
                      />

                      {field.state.meta.errors?.[0]?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* PHONE */}
                <form.Field name="phone">
                  {(field) => (
                    <div>
                      <Label>Phone *</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="01XXXXXXXXX"
                      />

                      {field.state.meta.errors?.[0]?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* SUBJECT */}
                <form.Field name="subject">
                  {(field) => (
                    <div>
                      <Label>Subject *</Label>

                      <Select
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>

                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {field.state.meta.errors?.[0]?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* MESSAGE */}
                <form.Field name="message">
                  {(field) => (
                    <div>
                      <Label>Message *</Label>

                      <Textarea
                        rows={5}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Tell us how we can help you..."
                      />

                      {field.state.meta.errors?.[0]?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
