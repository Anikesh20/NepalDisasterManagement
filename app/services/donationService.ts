// Mock donation service for demonstration purposes
// In a real app, this would connect to a payment gateway and backend API

export interface DonationResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  amount?: number;
  timestamp?: string;
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
  // Process a donation (mock implementation)
  async makeDonation(amount: number): Promise<DonationResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful donation (in a real app, this would call a payment gateway)
    if (amount > 0) {
      const transactionId = 'txn-' + Math.random().toString(36).substring(2, 10);
      
      // Add to mock history
      mockDonationHistory.unshift({
        id: 'don-' + Math.random().toString(36).substring(2, 7),
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        campaign: 'Disaster Relief Fund'
      });
      
      return {
        success: true,
        transactionId,
        message: 'Donation successful',
        amount,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Invalid donation amount'
      };
    }
  }

  // Get donation history for the current user
  async getDonationHistory(): Promise<DonationHistory[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock donation history
    return [...mockDonationHistory];
  }

  // Get total amount donated by the user
  async getTotalDonated(): Promise<number> {
    const history = await this.getDonationHistory();
    return history.reduce((total, donation) => {
      if (donation.status === 'completed') {
        return total + donation.amount;
      }
      return total;
    }, 0);
  }
}

export default new DonationService();
