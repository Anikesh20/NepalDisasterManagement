import { API_CONFIG } from '../config/api';
import { DonationResponse } from './donationService';

class EmailService {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private getDonationEmailTemplate(
    email: string,
    donationDetails: DonationResponse
  ) {
    const formattedAmount = this.formatCurrency(donationDetails.amount || 0);
    const date = new Date(donationDetails.timestamp || '').toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      to: email,
      from: {
        email: API_CONFIG.SENDGRID_FROM_EMAIL,
        name: API_CONFIG.SENDGRID_FROM_NAME,
      },
      subject: `Thank you for your donation of ${formattedAmount}`,
      text: `
Dear Donor,

Thank you for your generous donation of ${formattedAmount} to Nepal Disaster Management.

Transaction Details:
- Transaction ID: ${donationDetails.transactionId}
- Amount: ${formattedAmount}
- Date: ${date}
- Status: Completed

Your contribution will help us provide immediate relief and support to disaster victims across Nepal.

If you have any questions about your donation, please contact us at ${API_CONFIG.SUPPORT_EMAIL} or call ${API_CONFIG.SUPPORT_PHONE}.

Thank you for your support,
${API_CONFIG.APP_NAME} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .amount { font-size: 24px; color: #FF5A5F; font-weight: bold; }
    .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Donation!</h1>
    </div>
    
    <p>Dear Donor,</p>
    
    <p>Thank you for your generous donation of <span class="amount">${formattedAmount}</span> to Nepal Disaster Management.</p>
    
    <div class="details">
      <h3>Transaction Details:</h3>
      <p><strong>Transaction ID:</strong> ${donationDetails.transactionId}</p>
      <p><strong>Amount:</strong> ${formattedAmount}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Status:</strong> Completed</p>
    </div>
    
    <p>Your contribution will help us provide immediate relief and support to disaster victims across Nepal.</p>
    
    <p>If you have any questions about your donation, please contact us at <a href="mailto:${API_CONFIG.SUPPORT_EMAIL}">${API_CONFIG.SUPPORT_EMAIL}</a> or call ${API_CONFIG.SUPPORT_PHONE}.</p>
    
    <div class="footer">
      <p>Thank you for your support,<br>${API_CONFIG.APP_NAME} Team</p>
    </div>
  </div>
</body>
</html>
      `,
    };
  }

  async sendDonationConfirmation(email: string, donationDetails: DonationResponse) {
    try {
      const emailData = this.getDonationEmailTemplate(email, donationDetails);
      
      // Call backend API to send email
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Email confirmation sent successfully',
      };
    } catch (error) {
      console.error('Error sending email confirmation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email confirmation',
      };
    }
  }

  private async getAuthToken(): Promise<string> {
    // Get auth token from your auth service
    // This should be implemented based on your authentication system
    return '';
  }
}

export default new EmailService(); 