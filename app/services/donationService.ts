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
  payment_intent_id: string;
  payment_method: string;
  currency: string;
  created_at: string;
}

// Mock donation history data
const mockDonationHistory: DonationHistory[] = [
  {
    id: 'don-001',
    amount: 500,
    date: '2023-05-15',
    status: 'completed',
    campaign: 'Earthquake Relief Fund',
    payment_intent_id: 'pi_1234567890',
    payment_method: 'card',
    currency: 'npr',
    created_at: '2023-05-15T10:00:00'
  },
  {
    id: 'don-002',
    amount: 1000,
    date: '2023-06-22',
    status: 'completed',
    campaign: 'Flood Relief Fund',
    payment_intent_id: 'pi_1234567891',
    payment_method: 'card',
    currency: 'npr',
    created_at: '2023-06-22T10:00:00'
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
      console.log("donationService getDonationHistory response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("donationService getDonationHistory error response:", errorText);
        throw new Error("Failed to fetch donation history: " + errorText);
      }
      const data = await response.json();
      console.log("donationService getDonationHistory response data:", data);
      
      // Map the data to match DonationHistory interface with actual payment details
      return data.map((payment: any) => ({
        id: payment.id.toString(),
        amount: payment.amount,
        date: new Date(payment.created_at).toISOString().split('T')[0],
        status: payment.status === 'succeeded' ? 'completed' : 
                payment.status === 'pending' ? 'pending' : 'failed',
        campaign: payment.campaign || 'General Relief Fund',
        payment_intent_id: payment.payment_intent_id,
        payment_method: payment.payment_method || 'card',
        currency: payment.currency || 'npr',
        created_at: payment.created_at
      }));
    } catch (error) {
      console.error("donationService getDonationHistory error:", error);
      throw error;
    }
  }

  // Get total amount donated by the user
  async getTotalDonated(): Promise<number> {
    try {
      const history = await this.getDonationHistory();
      console.log("donationService getTotalDonated history:", history);
      const total = history.reduce((total, donation) => {
        if (donation.status === "completed") {
           return total + donation.amount;
        }
        return total;
      }, 0);
      console.log("donationService getTotalDonated computed total:", total);
      return total;
    } catch (error) {
      console.error("donationService getTotalDonated error:", error);
      return 0;
    }
  }
}

export default new DonationService();
