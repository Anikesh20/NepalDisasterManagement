import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface PaymentConfirmationResponse {
  success: boolean;
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
  notificationSent?: boolean;
}

class PaymentService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Making payment request to:', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Payment request failed:', error);
      throw new Error(error.details || error.error || 'Payment request failed');
    }

    return response.json();
  }

  async createPaymentIntent(amount: number): Promise<PaymentIntentResponse> {
    console.log('Creating payment intent for amount:', amount);
    return this.fetchWithAuth('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmationResponse> {
    console.log('Confirming payment for intent:', paymentIntentId);
    
    // Always use hardcoded phone number for testing
    const phoneNumber = '+9779860651033';
    console.log('Using hardcoded phone number:', phoneNumber);
    
    return this.fetchWithAuth('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ 
        paymentIntentId,
        phoneNumber
      }),
    });
  }
}

export default new PaymentService(); 