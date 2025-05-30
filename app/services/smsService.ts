import { API_CONFIG } from '../config/api';
import { DonationResponse } from './donationService';

class SMSService {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('977')) {
      return `+977${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  private getDonationSMSTemplate(donationDetails: DonationResponse): string {
    const formattedAmount = this.formatCurrency(donationDetails.amount || 0);
    const date = new Date(donationDetails.timestamp || '').toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return `Thank you for your donation of ${formattedAmount} to Nepal Disaster Management. Transaction ID: ${donationDetails.transactionId}. Date: ${date}. For support, call ${API_CONFIG.SUPPORT_PHONE}.`;
  }

  async sendDonationConfirmation(phoneNumber: string, donationDetails: DonationResponse) {
    try {
      const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.getDonationSMSTemplate(donationDetails);

      // Call backend API to send SMS
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/notifications/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          to: formattedPhoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'SMS confirmation sent successfully',
      };
    } catch (error) {
      console.error('Error sending SMS confirmation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send SMS confirmation',
      };
    }
  }

  private async getAuthToken(): Promise<string> {
    // Get auth token from your auth service
    // This should be implemented based on your authentication system
    return '';
  }
}

export default new SMSService(); 