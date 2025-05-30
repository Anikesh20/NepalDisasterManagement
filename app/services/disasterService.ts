
// Types of disasters
export enum DisasterType {
  EARTHQUAKE = 'earthquake',
  FLOOD = 'flood',
  FIRE = 'fire',
  LANDSLIDE = 'landslide',
  AVALANCHE = 'avalanche',
  STORM = 'storm',
  DROUGHT = 'drought',
}

// Severity levels
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Interface for disaster data
export interface DisasterData {
  id: string;
  type: DisasterType;
  title: string;
  location: string;
  district: string;
  timestamp: string;
  severity: SeverityLevel;
  affectedArea: string;
  description: string;
  casualties?: number;
  evacuees?: number;
  isActive: boolean;
  updatedAt: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Mock data for disasters (until backend is implemented)
const mockDisasters: DisasterData[] = [
  {
    id: '1',
    type: DisasterType.EARTHQUAKE,
    title: 'Magnitude 4.5 Earthquake',
    location: 'Kathmandu Valley',
    district: 'Kathmandu',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
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
    title: 'Severe Flooding',
    location: 'Terai Region',
    district: 'Saptari',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    severity: SeverityLevel.HIGH,
    affectedArea: 'Multiple villages along Koshi River',
    description: 'Heavy rainfall has caused the Koshi River to overflow, flooding several villages.',
    casualties: 2,
    evacuees: 500,
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 26.6483,
      longitude: 86.9483,
    },
  },
  {
    id: '3',
    type: DisasterType.FIRE,
    title: 'Forest Fire',
    location: 'Shivapuri National Park',
    district: 'Kathmandu',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    severity: SeverityLevel.HIGH,
    affectedArea: 'Northern section of the park',
    description: 'A large forest fire has broken out in Shivapuri National Park. Firefighters are working to contain it.',
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 27.8154,
      longitude: 85.3870,
    },
  },
  {
    id: '4',
    type: DisasterType.LANDSLIDE,
    title: 'Major Landslide',
    location: 'Sindhupalchok',
    district: 'Sindhupalchok',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    severity: SeverityLevel.CRITICAL,
    affectedArea: 'Mountainous regions of Sindhupalchok',
    description: 'Heavy rainfall triggered a massive landslide blocking the highway and affecting several villages.',
    casualties: 5,
    evacuees: 200,
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 27.9512,
      longitude: 85.6846,
    },
  },
  {
    id: '5',
    type: DisasterType.STORM,
    title: 'Severe Thunderstorm',
    location: 'Pokhara',
    district: 'Kaski',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    severity: SeverityLevel.MEDIUM,
    affectedArea: 'Pokhara Valley',
    description: 'A severe thunderstorm with strong winds has damaged several structures and caused power outages.',
    casualties: 0,
    evacuees: 0,
    isActive: true,
    updatedAt: new Date().toISOString(),
    coordinates: {
      latitude: 28.2096,
      longitude: 83.9856,
    },
  },
];

// Get all active disasters
export const getActiveDisasters = async (): Promise<DisasterData[]> => {
  try {
    // In a real implementation, this would fetch from an API
    // const response = await fetch(`${API_URL}/disasters/active`);
    // const data = await response.json();
    // return data;
    
    // For now, return mock data
    return mockDisasters.filter(disaster => disaster.isActive);
  } catch (error) {
    console.error('Error fetching active disasters:', error);
    throw error;
  }
};

// Get disasters by type
export const getDisastersByType = async (type: DisasterType): Promise<DisasterData[]> => {
  try {
    // In a real implementation, this would fetch from an API
    // const response = await fetch(`${API_URL}/disasters/type/${type}`);
    // const data = await response.json();
    // return data;
    
    // For now, filter mock data
    return mockDisasters.filter(disaster => disaster.type === type && disaster.isActive);
  } catch (error) {
    console.error(`Error fetching ${type} disasters:`, error);
    throw error;
  }
};

// Get disaster by ID
export const getDisasterById = async (id: string): Promise<DisasterData | null> => {
  try {
    // In a real implementation, this would fetch from an API
    // const response = await fetch(`${API_URL}/disasters/${id}`);
    // const data = await response.json();
    // return data;
    
    // For now, find in mock data
    const disaster = mockDisasters.find(d => d.id === id);
    return disaster || null;
  } catch (error) {
    console.error(`Error fetching disaster with ID ${id}:`, error);
    throw error;
  }
};

// Get icon name for disaster type
export const getDisasterIcon = (type: DisasterType): string => {
  switch (type) {
    case DisasterType.EARTHQUAKE:
      return 'earth';
    case DisasterType.FLOOD:
      return 'water';
    case DisasterType.FIRE:
      return 'flame';
    case DisasterType.LANDSLIDE:
      return 'trending-down';
    case DisasterType.AVALANCHE:
      return 'snow';
    case DisasterType.STORM:
      return 'thunderstorm';
    case DisasterType.DROUGHT:
      return 'sunny';
    default:
      return 'alert-circle';
  }
};

// Get color for disaster type
export const getDisasterColor = (type: DisasterType): string => {
  switch (type) {
    case DisasterType.EARTHQUAKE:
      return '#8B4513'; // Brown
    case DisasterType.FLOOD:
      return '#1E90FF'; // Blue
    case DisasterType.FIRE:
      return '#FF4500'; // Red-Orange
    case DisasterType.LANDSLIDE:
      return '#A0522D'; // Sienna
    case DisasterType.AVALANCHE:
      return '#87CEEB'; // Sky Blue
    case DisasterType.STORM:
      return '#4B0082'; // Indigo
    case DisasterType.DROUGHT:
      return '#FFA500'; // Orange
    default:
      return '#808080'; // Gray
  }
};

// Get color for severity level
export const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case SeverityLevel.LOW:
      return '#4CAF50'; // Green
    case SeverityLevel.MEDIUM:
      return '#FFC107'; // Amber
    case SeverityLevel.HIGH:
      return '#FF9800'; // Orange
    case SeverityLevel.CRITICAL:
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Gray
  }
};

const disasterService = {
  getActiveDisasters,
  getDisastersByType,
  getDisasterById,
  getDisasterIcon,
  getDisasterColor,
  getSeverityColor,
};

export default disasterService;
