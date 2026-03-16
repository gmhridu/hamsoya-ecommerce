import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetOtpProps {
  userName: string;
  otp: string;
  brandName?: string;
  expiresIn?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

export const PasswordResetOtp = ({
  userName = 'User',
  otp = '000000',
  brandName = 'Hamsoya',
  expiresIn = '10 minutes',
}: PasswordResetOtpProps) => {
  const previewText = `Reset your ${brandName} password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="60"
              height="60"
              alt={brandName}
              style={logo}
            />
          </Section>

          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            We received a request to reset your password for your {brandName}{' '}
            account. Use the verification code below:
          </Text>

          <Section style={otpContainer}>
            <Text style={otpText}>{otp}</Text>
          </Section>

          <Text style={text}>
            This code will expire in {expiresIn}. If you didn't request a
            password reset, please ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            © 2024 {brandName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0',
  marginBottom: '64px',
  maxWidth: '580px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const logo = {
  borderRadius: '50%',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
  padding: '0 40px',
  margin: '16px 0',
};

const otpContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '20px 40px',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
};

const otpText = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '8px',
  textAlign: 'center' as const,
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  padding: '0 40px',
  margin: '8px 0',
};

export default PasswordResetOtp;
