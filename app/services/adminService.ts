import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import { DisasterData, DisasterType, SeverityLevel } from './disasterService';
import { DonationHistory } from './donationService';
import { DisasterReport } from './reportService';

// Mock user data for admin panel
export interface UserData {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  district: string;
  blood_group: string | null;
  is_volunteer: boolean;
  created_at: string;
}

// Mock volunteer data for admin panel
export interface VolunteerData {
  id: string;
  user_id: string;
  user_name: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

// Admin dashboard statistics
export interface AdminStats {
  totalUsers: number;
  totalVolunteers: number;
  totalDisasters: number;
  activeDisasters: number;
  totalReports: number;
  pendingReports: number;
  totalDonations: number;
  totalDonationAmount: number;
}

// Mock users data
const mockUsers: UserData[] = [
  {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    full_name: 'Test User',
    phone_number: '9876543210',
    district: 'Kathmandu',
    blood_group: 'O+',
    is_volunteer: true,
    created_at: '2023-01-15T08:30:00Z',
  },
  {
    id: '2',
    email: 'john@example.com',
    username: 'johndoe',
    full_name: 'John Doe',
    phone_number: '9876543211',
    district: 'Lalitpur',
    blood_group: 'A+',
    is_volunteer: false,
    created_at: '2023-02-20T10:15:00Z',
  },
  {
    id: '3',
    email: 'jane@example.com',
    username: 'janedoe',
    full_name: 'Jane Doe',
    phone_number: '9876543212',
    district: 'Bhaktapur',
    blood_group: 'B-',
    is_volunteer: true,
    created_at: '2023-03-10T14:45:00Z',
  },
];

// Mock volunteers data
const mockVolunteers: VolunteerData[] = [
  {
    id: '1',
    user_id: '1',
    user_name: 'Test User',
    skills: ['First Aid', 'Search and Rescue'],
    availability: 'Weekends',
    status: 'active',
    created_at: '2023-01-15T09:00:00Z',
  },
  {
    id: '2',
    user_id: '3',
    user_name: 'Jane Doe',
    skills: ['Medical', 'Communication'],
    availability: 'Full-time',
    status: 'active',
    created_at: '2023-03-10T15:00:00Z',
  },
];

// Mock disasters data
const mockDisasters: DisasterData[] = [
  {
    id: '1',
    type: DisasterType.EARTHQUAKE,
    title: 'Magnitude 4.5 Earthquake',
    location: 'Kathmandu Valley',
    district: 'Kathmandu',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: SeverityLevel.MEDIUM,
    affectedArea: 'Central Kathmandu',
    description: 'A moderate earthquake was felt across Kathmandu Valley. No major damage reported.',
    casualties: 0,
    evacuees: 50,
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 27.7172,
      longitude: 85.3240,
    },
  },
  {
    id: '2',
    type: DisasterType.FLOOD,
    title: 'Flash Flood in Terai Region',
    location: 'Saptari District',
    district: 'Saptari',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    severity: SeverityLevel.HIGH,
    affectedArea: 'Multiple villages in Saptari',
    description: 'Heavy rainfall has caused flash flooding in several villages. Evacuation efforts are ongoing.',
    casualties: 2,
    evacuees: 500,
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 26.6725,
      longitude: 86.6946,
    },
  },
];

// Mock reports data
const mockReports: DisasterReport[] = [
  {
    id: 'report-1',
    type: DisasterType.FIRE,
    title: 'Forest Fire in Shivapuri',
    location: 'Shivapuri National Park',
    district: 'Kathmandu',
    description: 'Smoke visible from northern part of the park. Fire seems to be spreading quickly.',
    severity: SeverityLevel.HIGH,
    reportedBy: '1',
    contactNumber: '9841234567',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'verified',
    coordinates: {
      latitude: 27.8154,
      longitude: 85.3870,
    },
  },
  {
    id: 'report-2',
    type: DisasterType.FLOOD,
    title: 'Flash Flood in Lalitpur',
    location: 'Godavari Area',
    district: 'Lalitpur',
    description: 'Heavy rainfall has caused flash flooding in Godavari area. Several houses affected.',
    severity: SeverityLevel.MEDIUM,
    reportedBy: '2',
    contactNumber: '9841234567',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    coordinates: {
      latitude: 27.5971,
      longitude: 85.3345,
    },
  },
];

// Mock donations data
const mockDonations: DonationHistory[] = [
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
  },
  {
    id: 'don-003',
    amount: 2000,
    date: '2023-07-10',
    status: 'completed',
    campaign: 'Disaster Relief Fund'
  },
];

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    totalUsers: mockUsers.length,
    totalVolunteers: mockVolunteers.length,
    totalDisasters: mockDisasters.length,
    activeDisasters: mockDisasters.filter(d => d.isActive).length,
    totalReports: mockReports.length,
    pendingReports: mockReports.filter(r => r.status === 'pending').length,
    totalDonations: mockDonations.length,
    totalDonationAmount: mockDonations.reduce((sum, donation) => sum + donation.amount, 0),
  };
};

// Get all users
export const getAllUsers = async (): Promise<UserData[]> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockUsers];
};

// Get all volunteers
export const getAllVolunteers = async (): Promise<VolunteerData[]> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockVolunteers];
};

// Get all disasters
export const getAllDisasters = async (): Promise<DisasterData[]> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockDisasters];
};

// Get all reports
export const getAllReports = async (): Promise<DisasterReport[]> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockReports];
};

// Get all donations
export const getAllDonations = async (): Promise<DonationHistory[]> => {
  // In a real implementation, this would fetch from the API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockDonations];
};

const adminService = {
  getAdminStats,
  getAllUsers,
  getAllVolunteers,
  getAllDisasters,
  getAllReports,
  getAllDonations,
};

export default adminService;
