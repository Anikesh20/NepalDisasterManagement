// Mock donation service for demonstration purposes
// In a real app, this would connect to a payment gateway and backend API

import { API_BASE_URL } from '../config/api';
import authService from './authService';
import notificationService from './notificationService';

export interface DonationResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  amount?: number;
  timestamp?: string;
  notificationSent?: boolean;
}

export interface DonationHistory {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  campaign: string;
}

// Mock donation history data
const mockDonationHistory: DonationHistory[] = [
  {
    id: 'don-001',
    amount: 500,
    date: '2023-05-15',
    status: 'completed',
    campaign: 'Earthquake Relief Fund'
  },
  {
    id: 'don-002',
    amount: 1000,
    date: '2023-06-22',
    status: 'completed',
    campaign: 'Flood Relief Fund'
  }
];

class DonationService {
  // Process a donation
  async makeDonation(amount: number): Promise<DonationResponse> {
    try {
      // Get current user info
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create payment intent
      const createIntentResponse = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getToken()}`
        },
        body: JSON.stringify({ amount: amount * 100 }) // Convert to paisa
      });

      if (!createIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await createIntentResponse.json();

      // Confirm payment
      const confirmResponse = await fetch(`${API_BASE_URL}/api/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getToken()}`
        },
        body: JSON.stringify({ 
          paymentIntentId,
          phoneNumber: currentUser.phoneNumber // Include phone number for SMS
        })
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      const paymentResult = await confirmResponse.json();
      
      if (paymentResult.success) {
        const donationResponse: DonationResponse = {
          success: true,
          transactionId: paymentIntentId,
          message: 'Donation successful',
          amount,
          timestamp: new Date().toISOString(),
          notificationSent: paymentResult.notificationSent
        };

        // Send additional confirmations if needed
        await notificationService.sendDonationConfirmation(
          currentUser.id,
          currentUser.email,
          currentUser.phoneNumber,
          donationResponse
        );

        return donationResponse;
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Donation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Donation failed'
      };
    }
  }

  // Get donation history for the current user
  async getDonationHistory(): Promise<DonationHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/history`, {
        headers: {
          'Authorization': `Bearer ${await authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donation history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching donation history:', error);
      return [];
    }
  }

  // Get total amount donated by the user
  async getTotalDonated(): Promise<number> {
    try {
      const history = await this.getDonationHistory();
      return history.reduce((total, donation) => {
        if (donation.status === 'completed') {
          return total + donation.amount;
        }
        return total;
      }, 0);
    } catch (error) {
      console.error('Error calculating total donations:', error);
      return 0;
    }
  }
}

export default new DonationService();
