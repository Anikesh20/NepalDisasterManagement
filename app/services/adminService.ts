import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { DisasterData, DisasterType, SeverityLevel } from './disasterService';
import { DonationHistory } from './donationService';
import { DisasterReport } from './reportService';

// Use the configured API base URL
const ADMIN_API_URL = `${API_BASE_URL}/api`;

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
  profile_image?: string;
  weekly_availability?: string;
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
  try {
    console.log('[adminService] Getting admin token...');
    // Get the admin token
    const adminToken = await AsyncStorage.getItem('adminToken');
    console.log('[adminService] Admin token exists:', !!adminToken);
    
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }

    console.log('[adminService] Fetching admin stats from:', `${ADMIN_API_URL}/stats`);
    // Fetch stats from the backend API
    const response = await fetch(`${ADMIN_API_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('[adminService] Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[adminService] Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch admin stats');
    }

    const data = await response.json();
    console.log('[adminService] Received stats data:', data);
    
    return {
      totalUsers: data.totalUsers || 0,
      totalVolunteers: data.totalVolunteers || 0,
      totalDisasters: data.totalDisasters || 0,
      activeDisasters: data.activeDisasters || 0,
      totalReports: data.totalReports || 0,
      pendingReports: data.pendingReports || 0,
      totalDonations: data.totalDonations || 0,
      totalDonationAmount: data.totalDonationAmount || 0,
    };
  } catch (error) {
    console.error('[adminService] Error in getAdminStats:', error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    console.log('[adminService] Getting admin token...');
    // Get the admin token
    const adminToken = await AsyncStorage.getItem('adminToken');
    console.log('[adminService] Admin token exists:', !!adminToken);
    
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }

    console.log('[adminService] Fetching users from:', `${ADMIN_API_URL}/users`);
    // Fetch users from the backend API
    const response = await fetch(`${ADMIN_API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('[adminService] Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[adminService] Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data = await response.json();
    console.log('[adminService] Received users data:', data);
    
    if (!data.users || !Array.isArray(data.users)) {
      console.error('[adminService] Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }

    const mappedUsers = data.users.map((user: any) => ({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone_number: user.phone_number,
      district: user.district,
      blood_group: user.blood_group,
      is_volunteer: user.is_volunteer,
      created_at: user.created_at
    }));
    
    console.log('[adminService] Mapped users:', mappedUsers);
    return mappedUsers;
  } catch (error) {
    console.error('[adminService] Error in getAllUsers:', error);
    throw error;
  }
};

// Get all volunteers
export const getAllVolunteers = async (): Promise<VolunteerData[]> => {
  try {
    const adminToken = await AsyncStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }
    const response = await fetch(`${ADMIN_API_URL}/admin/volunteers`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch volunteers');
    }
    const data = await response.json();
    if (!data.volunteers || !Array.isArray(data.volunteers)) {
      throw new Error('Invalid response format from server');
    }
    // Map DB rows to VolunteerData
    return data.volunteers.map((v: any) => ({
      id: v.id.toString(),
      user_id: v.user_id.toString(),
      user_name: v.full_name || v.user_name || '',
      skills: v.skills || [],
      availability: v.availability || '',
      profile_image: v.profile_image,
      weekly_availability: v.weekly_availability,
      status: v.status,
      created_at: v.created_at,
    }));
  } catch (error) {
    console.error('[adminService] Error in getAllVolunteers:', error);
    throw error;
  }
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
  try {
    const token = await AsyncStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const response = await fetch(`${ADMIN_API_URL}/reports/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reports');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Update report status
export const updateReportStatus = async (reportId: string, status: 'pending' | 'verified' | 'rejected'): Promise<DisasterReport> => {
  try {
    const token = await AsyncStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const response = await fetch(`${ADMIN_API_URL}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update report status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Get all donations (admin) – updated to fetch from /api/payments/all
export const getAllDonations = async (): Promise<DonationHistory[]> => {
  try {
    console.log('[adminService] Getting admin token...');
    const adminToken = await AsyncStorage.getItem('adminToken');
    console.log('[adminService] Admin token exists:', !!adminToken);
    
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }

    const url = `${API_BASE_URL}/api/payments/all`;
    console.log('[adminService] Fetching donations from:', url);
    
    const response = await fetch(url, {
      headers: { 
        "Authorization": `Bearer ${adminToken}`, 
        "Accept": "application/json" 
      }
    });
    
    console.log('[adminService] Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[adminService] Error response:', errorData);
      throw new Error(errorData.error || "Failed to fetch all payments");
    }
    
    const rows = await response.json();
    console.log('[adminService] Received payment rows:', rows);
    
    // Map DB rows to DonationHistory format
    const donations: DonationHistory[] = rows.map((row: any) => ({
      id: row.id,
      amount: row.amount,
      date: new Date(row.created_at).toISOString().split("T")[0],
      status: (row.status === "succeeded" ? "completed" : (row.status === "pending" ? "pending" : "failed")),
      campaign: "General Relief Fund" // (or use a dynamic value if available)
    }));
    
    console.log('[adminService] Mapped donations:', donations);
    return donations;
  } catch (error) {
    console.error("[adminService] Error in getAllDonations:", error);
    throw error;
  }
};

export const verifyVolunteer = async (volunteerId: string) => {
  const adminToken = await AsyncStorage.getItem('adminToken');
  if (!adminToken) throw new Error('Admin authentication required');
  const response = await fetch(`${ADMIN_API_URL}/admin/volunteers/${volunteerId}/verify`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify volunteer');
  }
  return await response.json();
};

export const rejectVolunteer = async (volunteerId: string) => {
  const adminToken = await AsyncStorage.getItem('adminToken');
  if (!adminToken) throw new Error('Admin authentication required');
  const response = await fetch(`${ADMIN_API_URL}/admin/volunteers/${volunteerId}/reject`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to reject volunteer');
  }
  return await response.json();
};

const adminService = {
  getAdminStats,
  getAllUsers,
  getAllVolunteers,
  getAllDisasters,
  getAllReports,
  updateReportStatus,
  getAllDonations,
  verifyVolunteer,
  rejectVolunteer,
};

export default adminService;
