import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { colors } from '../styles/theme';
import { API_URL } from './config';
import { DisasterType, SeverityLevel } from './disasterService';

// Interface for disaster report
export interface DisasterReport {
  id?: string;
  type: DisasterType;
  title: string;
  location: string;
  district: string;
  description: string;
  severity: SeverityLevel;
  reportedBy: string;
  reporterName?: string;
  contactNumber?: string;
  images?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifierName?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in to submit a report.');
  }
  return token;
};

// Helper function to handle network errors
const handleNetworkError = (error: any): Error => {
  console.error('Network error details:', error);
  
  if (error.message === 'Network request failed') {
    // Check if we're in development and using the correct API URL
    if (__DEV__) {
      const platform = Platform.OS;
      const expectedUrl = platform === 'android' 
        ? 'http://10.0.2.2:3000/api'
        : platform === 'ios'
          ? 'http://localhost:3000/api'
          : `http://${getLocalIP()}:3000/api`;
      
      return new Error(
        `Network request failed. Please ensure:\n` +
        `1. The backend server is running\n` +
        `2. You're using the correct API URL (${expectedUrl})\n` +
        `3. Your device/emulator can reach the server`
      );
    }
    return new Error('Network request failed. Please check your internet connection and try again.');
  }
  
  return error;
};

// Submit a new disaster report
export const submitDisasterReport = async (report: DisasterReport): Promise<DisasterReport> => {
  try {
    console.log('Submitting report to:', `${API_URL}/reports`);
    const token = await getAuthToken();
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add report data
    formData.append('type', report.type);
    formData.append('title', report.title);
    formData.append('location', report.location);
    formData.append('district', report.district);
    formData.append('description', report.description);
    formData.append('severity', report.severity);
    formData.append('contactNumber', report.contactNumber || '');
    
    if (report.coordinates) {
      formData.append('latitude', report.coordinates.latitude.toString());
      formData.append('longitude', report.coordinates.longitude.toString());
    }
    
    // Add images if any
    if (report.images && report.images.length > 0) {
      report.images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });
    }
    
    console.log('Sending request with headers:', {
      'Authorization': 'Bearer [REDACTED]',
      'Accept': 'application/json',
    });
    
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(error.error || 'Failed to submit report');
    }
    
    const data = await response.json();
    console.log('Report submitted successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error submitting report:', error);
    throw handleNetworkError(error);
  }
};

// Get user's submitted reports
export const getUserReports = async (userId: string): Promise<DisasterReport[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/reports/my-reports`, {
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
    console.error('Error fetching user reports:', error);
    throw error;
  }
};

// Get all reports (for admin)
export const getAllReports = async (): Promise<DisasterReport[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/reports/admin`, {
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
    console.error('Error fetching all reports:', error);
    throw error;
  }
};

// Update report status (for admin)
export const updateReportStatus = async (reportId: string, status: 'pending' | 'verified' | 'rejected'): Promise<DisasterReport> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/reports/${reportId}/status`, {
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

// Get a single report
export const getReport = async (reportId: string): Promise<DisasterReport> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch report');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

// Helper functions for UI
export const getReportStatusColor = (status: DisasterReport['status']): string => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'verified':
      return colors.success;
    case 'rejected':
      return colors.danger;
    default:
      return colors.textLight;
  }
};

export const getReportStatusText = (status: DisasterReport['status']): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const reportService = {
  submitDisasterReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getReport,
  getReportStatusColor,
  getReportStatusText,
};

export default reportService;
