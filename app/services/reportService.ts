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
  contactNumber?: string;
  images?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
}

// Mock function to simulate submitting a report to the server
export const submitDisasterReport = async (report: DisasterReport): Promise<DisasterReport> => {
  // In a real implementation, this would send the report to a server
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random ID for the report
  const reportWithId = {
    ...report,
    id: `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending' as const,
  };
  
  // In a real implementation, we would store this in a database
  // For now, we'll just return the report with an ID
  return reportWithId;
};

// Mock function to get user's submitted reports
export const getUserReports = async (userId: string): Promise<DisasterReport[]> => {
  // In a real implementation, this would fetch from an API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    {
      id: 'report-1',
      type: DisasterType.FIRE,
      title: 'Forest Fire in Shivapuri',
      location: 'Shivapuri National Park',
      district: 'Kathmandu',
      description: 'Smoke visible from northern part of the park. Fire seems to be spreading quickly.',
      severity: SeverityLevel.HIGH,
      reportedBy: userId,
      contactNumber: '9841234567',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
      reportedBy: userId,
      contactNumber: '9841234567',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      status: 'pending',
      coordinates: {
        latitude: 27.5971,
        longitude: 85.3345,
      },
    },
  ];
};

// Mock function to upload images
export const uploadReportImages = async (
  images: string[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  // In a real implementation, this would upload images to a server
  
  // Simulate upload progress
  if (onProgress) {
    for (let i = 0; i <= 100; i += 10) {
      onProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } else {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Return mock image URLs
  return images.map((_, index) => `https://example.com/disaster-image-${Date.now()}-${index}.jpg`);
};

// Get report status color
export const getReportStatusColor = (status: DisasterReport['status']): string => {
  switch (status) {
    case 'verified':
      return '#2ECC71'; // Green
    case 'pending':
      return '#F39C12'; // Orange
    case 'rejected':
      return '#E74C3C'; // Red
    default:
      return '#95A5A6'; // Gray
  }
};

// Get report status text
export const getReportStatusText = (status: DisasterReport['status']): string => {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending':
      return 'Pending Verification';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const reportService = {
  submitDisasterReport,
  getUserReports,
  uploadReportImages,
  getReportStatusColor,
  getReportStatusText,
};

export default reportService;
