import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { env } from '@/env';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = env.SMTP_FROM_EMAIL || 'noreply@hamsoya.com';
    this.initTransporter();
  }

  private initTransporter() {
    // Prefer Resend API if available (higher limits, no daily caps)
    if (env.RESEND_API_KEY) {
      console.log('📧 Email service initialized with Resend API (preferred - higher limits)');
      return; // Don't initialize SMTP if Resend is available
    }

    // Use SMTP only if Resend is not available
    if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10),
        secure: env.SMTP_PORT === '465',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      console.log('📧 Email service initialized with SMTP:', env.SMTP_HOST);
    } else {
      console.warn('⚠️ No email provider configured. Emails will not be sent.');
      console.log('⚠️ Please configure SMTP or Resend in .env file');
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    // Prefer Resend API if available (higher limits)
    if (env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Resend API error: ${error}`);
        }

        console.log(`✅ Email sent via Resend to ${options.to}`);
        return true;
      } catch (error) {
        console.error('❌ Failed to send email via Resend:', error);
      }
    }

    // Fallback to SMTP if available
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        console.log(`✅ Email sent via SMTP to ${options.to}`);
        return true;
      } catch (error) {
        console.error('❌ Failed to send email via SMTP:', error);
      }
    }

    console.error('❌ No email provider configured');
    return false;
  }

  async sendReactEmail<T>(options: { to: string; subject: string; emailComponent: React.ReactElement; text?: string }): Promise<boolean> {
    try {
      const html = await render(options.emailComponent);
      return await this.sendEmail({
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      });
    } catch (error) {
      console.error('❌ Failed to render React email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
