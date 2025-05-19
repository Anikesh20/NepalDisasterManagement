import { DisasterData, DisasterType } from './disasterService';

// Interface for historical disaster data
export interface HistoricalDisasterData extends DisasterData {
  resolvedAt?: string;
  casualties: number;
  evacuees: number;
  damagedStructures?: number;
  economicLoss?: number; // in USD
}

// Interface for disaster statistics
export interface DisasterStatistics {
  totalDisasters: number;
  byType: Record<DisasterType, number>;
  totalCasualties: number;
  totalEvacuees: number;
  totalDamagedStructures: number;
  totalEconomicLoss: number; // in USD
}

// Interface for monthly disaster data
export interface MonthlyDisasterData {
  month: string;
  count: number;
  casualties: number;
  byType: Record<DisasterType, number>;
}

// Mock historical disaster data (for demonstration purposes)
const mockHistoricalDisasters: HistoricalDisasterData[] = [
  {
    id: 'h1',
    type: DisasterType.EARTHQUAKE,
    title: 'Magnitude 5.2 Earthquake',
    location: 'Kathmandu Valley',
    district: 'Kathmandu',
    timestamp: '2023-01-15T08:30:00Z',
    resolvedAt: '2023-01-15T14:45:00Z',
    severity: 'high',
    affectedArea: 'Central Kathmandu',
    description: 'A moderate earthquake struck Kathmandu Valley, causing some structural damage.',
    casualties: 3,
    evacuees: 250,
    damagedStructures: 45,
    economicLoss: 1200000,
    isActive: false,
    updatedAt: '2023-01-15T14:45:00Z',
    coordinates: {
      latitude: 27.7172,
      longitude: 85.3240,
    },
  },
  {
    id: 'h2',
    type: DisasterType.FLOOD,
    title: 'Monsoon Flooding',
    location: 'Terai Region',
    district: 'Saptari',
    timestamp: '2023-07-20T12:00:00Z',
    resolvedAt: '2023-07-25T18:30:00Z',
    severity: 'critical',
    affectedArea: 'Multiple villages along Koshi River',
    description: 'Heavy monsoon rainfall caused the Koshi River to overflow, flooding several villages.',
    casualties: 12,
    evacuees: 1500,
    damagedStructures: 320,
    economicLoss: 3500000,
    isActive: false,
    updatedAt: '2023-07-25T18:30:00Z',
    coordinates: {
      latitude: 26.6483,
      longitude: 86.9483,
    },
  },
  {
    id: 'h3',
    type: DisasterType.LANDSLIDE,
    title: 'Major Landslide',
    location: 'Sindhupalchok',
    district: 'Sindhupalchok',
    timestamp: '2023-08-05T04:15:00Z',
    resolvedAt: '2023-08-10T09:00:00Z',
    severity: 'high',
    affectedArea: 'Mountainous regions of Sindhupalchok',
    description: 'Heavy rainfall triggered a massive landslide blocking the highway and affecting several villages.',
    casualties: 8,
    evacuees: 350,
    damagedStructures: 75,
    economicLoss: 2100000,
    isActive: false,
    updatedAt: '2023-08-10T09:00:00Z',
    coordinates: {
      latitude: 27.9512,
      longitude: 85.6846,
    },
  },
  {
    id: 'h4',
    type: DisasterType.FIRE,
    title: 'Forest Fire',
    location: 'Chitwan National Park',
    district: 'Chitwan',
    timestamp: '2023-03-12T14:20:00Z',
    resolvedAt: '2023-03-15T11:45:00Z',
    severity: 'medium',
    affectedArea: 'Southern section of the park',
    description: 'A forest fire broke out in Chitwan National Park, affecting wildlife and vegetation.',
    casualties: 0,
    evacuees: 120,
    damagedStructures: 5,
    economicLoss: 800000,
    isActive: false,
    updatedAt: '2023-03-15T11:45:00Z',
    coordinates: {
      latitude: 27.5291,
      longitude: 84.3542,
    },
  },
  {
    id: 'h5',
    type: DisasterType.STORM,
    title: 'Severe Thunderstorm',
    location: 'Pokhara',
    district: 'Kaski',
    timestamp: '2023-05-18T18:30:00Z',
    resolvedAt: '2023-05-19T08:15:00Z',
    severity: 'medium',
    affectedArea: 'Pokhara Valley',
    description: 'A severe thunderstorm with strong winds damaged several structures and caused power outages.',
    casualties: 1,
    evacuees: 0,
    damagedStructures: 28,
    economicLoss: 450000,
    isActive: false,
    updatedAt: '2023-05-19T08:15:00Z',
    coordinates: {
      latitude: 28.2096,
      longitude: 83.9856,
    },
  },
  // Add more historical data for the current year
  {
    id: 'h6',
    type: DisasterType.EARTHQUAKE,
    title: 'Minor Earthquake',
    location: 'Dhading',
    district: 'Dhading',
    timestamp: '2024-01-05T10:15:00Z',
    resolvedAt: '2024-01-05T12:30:00Z',
    severity: 'low',
    affectedArea: 'Eastern Dhading',
    description: 'A minor earthquake was felt in Dhading district. No significant damage reported.',
    casualties: 0,
    evacuees: 0,
    damagedStructures: 3,
    economicLoss: 50000,
    isActive: false,
    updatedAt: '2024-01-05T12:30:00Z',
    coordinates: {
      latitude: 27.9711,
      longitude: 84.8985,
    },
  },
  {
    id: 'h7',
    type: DisasterType.FLOOD,
    title: 'Flash Flood',
    location: 'Bardiya',
    district: 'Bardiya',
    timestamp: '2024-02-28T16:45:00Z',
    resolvedAt: '2024-03-02T09:20:00Z',
    severity: 'medium',
    affectedArea: 'Southern Bardiya',
    description: 'Unexpected heavy rainfall caused flash flooding in parts of Bardiya district.',
    casualties: 2,
    evacuees: 180,
    damagedStructures: 42,
    economicLoss: 750000,
    isActive: false,
    updatedAt: '2024-03-02T09:20:00Z',
    coordinates: {
      latitude: 28.3102,
      longitude: 81.4279,
    },
  },
];

/**
 * Get historical disaster data
 */
export const getHistoricalDisasters = async (
  startDate?: string,
  endDate?: string,
  type?: DisasterType
): Promise<HistoricalDisasterData[]> => {
  // In a real implementation, this would fetch from an API with filters
  
  // Filter by date range and type
  let filtered = [...mockHistoricalDisasters];
  
  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter(disaster => new Date(disaster.timestamp).getTime() >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate).getTime();
    filtered = filtered.filter(disaster => new Date(disaster.timestamp).getTime() <= end);
  }
  
  if (type && type !== 'all') {
    filtered = filtered.filter(disaster => disaster.type === type);
  }
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Get disaster statistics
 */
export const getDisasterStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<DisasterStatistics> => {
  // Get filtered disasters
  const disasters = await getHistoricalDisasters(startDate, endDate);
  
  // Initialize statistics
  const statistics: DisasterStatistics = {
    totalDisasters: disasters.length,
    byType: {
      [DisasterType.EARTHQUAKE]: 0,
      [DisasterType.FLOOD]: 0,
      [DisasterType.FIRE]: 0,
      [DisasterType.LANDSLIDE]: 0,
      [DisasterType.AVALANCHE]: 0,
      [DisasterType.STORM]: 0,
      [DisasterType.DROUGHT]: 0,
    },
    totalCasualties: 0,
    totalEvacuees: 0,
    totalDamagedStructures: 0,
    totalEconomicLoss: 0,
  };
  
  // Calculate statistics
  disasters.forEach(disaster => {
    statistics.byType[disaster.type]++;
    statistics.totalCasualties += disaster.casualties;
    statistics.totalEvacuees += disaster.evacuees;
    statistics.totalDamagedStructures += disaster.damagedStructures || 0;
    statistics.totalEconomicLoss += disaster.economicLoss || 0;
  });
  
  return statistics;
};

/**
 * Get monthly disaster data for charts
 */
export const getMonthlyDisasterData = async (
  year?: number
): Promise<MonthlyDisasterData[]> => {
  // Default to current year if not specified
  const targetYear = year || new Date().getFullYear();
  
  // Get all disasters for the year
  const startDate = `${targetYear}-01-01T00:00:00Z`;
  const endDate = `${targetYear}-12-31T23:59:59Z`;
  const disasters = await getHistoricalDisasters(startDate, endDate);
  
  // Initialize monthly data
  const monthlyData: MonthlyDisasterData[] = [];
  for (let month = 0; month < 12; month++) {
    monthlyData.push({
      month: new Date(targetYear, month, 1).toLocaleString('default', { month: 'short' }),
      count: 0,
      casualties: 0,
      byType: {
        [DisasterType.EARTHQUAKE]: 0,
        [DisasterType.FLOOD]: 0,
        [DisasterType.FIRE]: 0,
        [DisasterType.LANDSLIDE]: 0,
        [DisasterType.AVALANCHE]: 0,
        [DisasterType.STORM]: 0,
        [DisasterType.DROUGHT]: 0,
      },
    });
  }
  
  // Populate monthly data
  disasters.forEach(disaster => {
    const date = new Date(disaster.timestamp);
    const month = date.getMonth();
    
    monthlyData[month].count++;
    monthlyData[month].casualties += disaster.casualties;
    monthlyData[month].byType[disaster.type]++;
  });
  
  return monthlyData;
};

const historicalDataService = {
  getHistoricalDisasters,
  getDisasterStatistics,
  getMonthlyDisasterData,
};

export default historicalDataService;
