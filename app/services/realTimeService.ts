import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import disasterService, { DisasterData } from './disasterService';

// Define task names
const BACKGROUND_FETCH_TASK = 'background-fetch-disasters';
const DISASTER_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Callback type for disaster updates
type DisasterUpdateCallback = (disasters: DisasterData[]) => void;

// Store for callbacks
const updateCallbacks: DisasterUpdateCallback[] = [];

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Fetch the latest disaster data
    const disasters = await disasterService.getActiveDisasters();
    
    // Compare with previous data and trigger notifications if needed
    // This would be implemented in a real app with actual API
    
    // Return success
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background fetch task
 */
export const registerBackgroundFetch = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registered');
    return true;
  } catch (error) {
    console.error('Background fetch registration failed:', error);
    return false;
  }
};

/**
 * Unregister the background fetch task
 */
export const unregisterBackgroundFetch = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered');
    return true;
  } catch (error) {
    console.error('Background fetch unregistration failed:', error);
    return false;
  }
};

/**
 * Check if background fetch is available
 */
export const checkBackgroundFetchStatus = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  return {
    status,
    isRegistered,
  };
};

// Variable to store the interval ID
let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Start polling for disaster updates
 */
export const startDisasterPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Initial fetch
  fetchAndNotify();
  
  // Set up interval
  pollingInterval = setInterval(fetchAndNotify, DISASTER_UPDATE_INTERVAL);
  
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};

/**
 * Stop polling for disaster updates
 */
export const stopDisasterPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

/**
 * Fetch disaster data and notify subscribers
 */
const fetchAndNotify = async () => {
  try {
    const disasters = await disasterService.getActiveDisasters();
    
    // Notify all subscribers
    updateCallbacks.forEach(callback => {
      callback(disasters);
    });
    
    return disasters;
  } catch (error) {
    console.error('Failed to fetch disaster updates:', error);
    return [];
  }
};

/**
 * Subscribe to disaster updates
 */
export const subscribeToDisasterUpdates = (callback: DisasterUpdateCallback) => {
  updateCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = updateCallbacks.indexOf(callback);
    if (index !== -1) {
      updateCallbacks.splice(index, 1);
    }
  };
};

/**
 * Fetch latest disaster data on demand
 */
export const fetchLatestDisasters = async (): Promise<DisasterData[]> => {
  return await fetchAndNotify();
};

const realTimeService = {
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  checkBackgroundFetchStatus,
  startDisasterPolling,
  stopDisasterPolling,
  subscribeToDisasterUpdates,
  fetchLatestDisasters,
};

export default realTimeService;
