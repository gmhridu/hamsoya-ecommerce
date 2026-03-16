import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailProps {
  userName?: string;
  otpCode?: string;
  verificationLink?: string;
  brandName?: string;
  expiresIn?: string;
}

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

// Brand colors
const colors = {
  primary: "#22c55e", // Green-500
  primaryDark: "#16a34a", // Green-600
  background: "#f0fdf4", // Green-50
  text: "#1f2937", // Gray-800
  textMuted: "#6b7280", // Gray-500
  border: "#e5e7eb", // Gray-200
};

export const VerifyEmail = ({
  userName = "User",
  otpCode,
  verificationLink,
  brandName = "Hamsoya",
  expiresIn = "24 hours",
}: VerifyEmailProps) => {
  const previewText = `Verify your email - ${brandName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={headerSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="80"
              height="80"
              alt={brandName}
              style={logo}
            />
            <Heading style={brandTitle}>{brandName}</Heading>
            <Text style={tagline}>
              Premium Organic Food & Everyday Essentials
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={h1}>Verify Your Email</Heading>

            <Text style={text}>Hi {userName},</Text>

            <Text style={text}>
              Thank you for creating an account with{" "}
              <strong>{brandName}</strong>. To complete your registration,
              please use the verification code below:
            </Text>

            {/* OTP Code Box */}
            {otpCode && (
              <Section style={otpContainer}>
                <Text style={otpLabel}>Your Verification Code</Text>
                <Text style={otpText}>{otpCode}</Text>
                <Text style={otpNote}>
                  This code will expire in {expiresIn}
                </Text>
              </Section>
            )}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerTitle}>Why verify your email?</Text>
            <ul style={footerList}>
              <li>Protect your account with enhanced security</li>
              <li>Receive order updates and delivery notifications</li>
              <li>Access exclusive deals and offers</li>
            </ul>

            <Hr style={hrSmall} />

            <Text style={footer}>© 2024 {brandName}. All rights reserved.</Text>
            <Text style={footerMuted}>
              This email was sent to you because you created an account on{" "}
              {brandName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: colors.background,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
};

const headerSection = {
  backgroundColor: colors.primary,
  padding: "40px 40px 30px",
  textAlign: "center" as const,
};

const logo = {
  borderRadius: "50%",
  margin: "0 auto 16px",
};

const brandTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const tagline = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  margin: "0",
};

const contentSection = {
  padding: "40px",
};

const h1: React.CSSProperties = {
  color: colors.text,
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  color: colors.text,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const otpContainer: React.CSSProperties = {
  backgroundColor: colors.background,
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
  border: `2px solid ${colors.primary}`,
};

const otpLabel: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const otpCode: React.CSSProperties = {
  color: colors.primary,
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const otpText: React.CSSProperties = {
  color: colors.primary,
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const otpNote: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: "12px",
  margin: "12px 0 0",
};

const button: React.CSSProperties = {
  backgroundColor: colors.primary,
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "14px 32px",
  margin: "24px 0",
};

const link: React.CSSProperties = {
  color: colors.primary,
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${colors.border}`,
  margin: "24px 40px",
};

const hrSmall: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${colors.border}`,
  margin: "24px 0",
};

const footerSection = {
  padding: "0 40px 40px",
};

const footerTitle: React.CSSProperties = {
  color: colors.text,
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const footerList: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0",
  paddingLeft: "20px",
};

const footer: React.CSSProperties = {
  color: colors.text,
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "16px 0 8px",
};

const footerMuted: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: "11px",
  textAlign: "center" as const,
  margin: "0",
};

export default VerifyEmail;
