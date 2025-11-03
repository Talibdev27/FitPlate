import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const emailApiKey = process.env.EMAIL_SERVICE_API_KEY;
    const emailFrom = process.env.EMAIL_FROM_ADDRESS;

    if (emailApiKey && emailFrom) {
      // Configure email service (SendGrid, SMTP, etc.)
      // This is a placeholder - configure based on your email provider
      this.transporter = nodemailer.createTransport({
        // Configure based on your email provider
        // For SendGrid, use SMTP settings
        // For other providers, adjust accordingly
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.log('[Email] Email service not configured, logging email:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.text || options.html}`);
        return true; // Return true for development
      }

      const emailFrom = process.env.EMAIL_FROM_ADDRESS || 'noreply@fooddelivery.uz';
      const emailFromName = process.env.EMAIL_FROM_NAME || 'Food Delivery';

      await this.transporter.sendMail({
        from: `"${emailFromName}" <${emailFrom}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendOTPEmail(email: string, code: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Your Verification Code',
      html: `
        <h2>Verification Code</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
    });
  }

  async sendOrderConfirmation(email: string, orderDetails: any): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h2>Order Confirmed</h2>
        <p>Your order #${orderDetails.id} has been confirmed.</p>
        <p>Delivery date: ${orderDetails.deliveryDate}</p>
        <p>Total: ${orderDetails.totalPrice} UZS</p>
      `,
    });
  }
}

export const emailService = new EmailService();

