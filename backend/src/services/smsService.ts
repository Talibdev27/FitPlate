// SMS Service for OTP codes
// This is a placeholder - integrate with actual SMS provider (Twilio, local provider, etc.)

interface SMSService {
  sendOTP(phone: string, code: string): Promise<boolean>;
}

class SMSServiceImpl implements SMSService {
  private apiKey: string;
  private apiUrl: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.apiUrl = process.env.SMS_API_URL || '';
    this.senderName = process.env.SMS_SENDER_NAME || 'FoodDelivery';
  }

  async sendOTP(phone: string, code: string): Promise<boolean> {
    try {
      // TODO: Integrate with actual SMS provider
      // For now, log the OTP (remove in production)
      console.log(`[SMS] Sending OTP to ${phone}: ${code}`);
      
      // Example integration structure:
      // const response = await fetch(`${this.apiUrl}/send`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     to: phone,
      //     message: `Your verification code is: ${code}`,
      //     sender: this.senderName,
      //   }),
      // });
      
      // return response.ok;
      
      // For development, always return true
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }
}

export const smsService = new SMSServiceImpl();

