import { DisasterData, DisasterType, SeverityLevel } from './disasterService';

// Mock notification service for development
console.log('Using mock notification service - notifications disabled');

/**
 * Register for push notifications (mock)
 */
export const registerForPushNotifications = async () => {
  console.log('Mock: registerForPushNotifications called');
  return null;
};

/**
 * Send a local notification about a disaster (mock)
 */
export const sendDisasterNotification = async (disaster: DisasterData) => {
  // Get notification content based on disaster type and severity
  const { title, body } = getNotificationContent(disaster);
  console.log('Mock notification would be sent:', { title, body });
};

/**
 * Send a notification for a new disaster
 */
export const notifyNewDisaster = async (disaster: DisasterData) => {
  return await sendDisasterNotification(disaster);
};

/**
 * Send a notification for an updated disaster (mock)
 */
export const notifyDisasterUpdate = async (disaster: DisasterData, changes: string[]) => {
  const changeText = changes.join(', ');
  console.log('Mock: notifyDisasterUpdate called for', disaster.title, 'Changes:', changeText);
};

/**
 * Get notification content based on disaster type and severity
 */
const getNotificationContent = (disaster: DisasterData) => {
  let title = '';
  let body = '';

  // Set title based on severity
  switch (disaster.severity) {
    case SeverityLevel.CRITICAL:
      title = `CRITICAL ALERT: ${disaster.type.toUpperCase()} in ${disaster.location}`;
      break;
    case SeverityLevel.HIGH:
      title = `URGENT: ${disaster.type.toUpperCase()} in ${disaster.location}`;
      break;
    case SeverityLevel.MEDIUM:
      title = `Alert: ${disaster.type} in ${disaster.location}`;
      break;
    case SeverityLevel.LOW:
      title = `${disaster.type} reported in ${disaster.location}`;
      break;
    default:
      title = `${disaster.type} in ${disaster.location}`;
  }

  // Set body based on disaster type
  switch (disaster.type) {
    case DisasterType.EARTHQUAKE:
      body = `Magnitude earthquake reported. ${getActionText(disaster)}`;
      break;
    case DisasterType.FLOOD:
      body = `Flooding reported in ${disaster.affectedArea}. ${getActionText(disaster)}`;
      break;
    case DisasterType.FIRE:
      body = `Fire reported in ${disaster.affectedArea}. ${getActionText(disaster)}`;
      break;
    case DisasterType.LANDSLIDE:
      body = `Landslide reported in ${disaster.affectedArea}. ${getActionText(disaster)}`;
      break;
    case DisasterType.STORM:
      body = `Storm affecting ${disaster.affectedArea}. ${getActionText(disaster)}`;
      break;
    default:
      body = `${disaster.description} ${getActionText(disaster)}`;
  }

  return { title, body };
};

/**
 * Get action text based on disaster severity
 */
const getActionText = (disaster: DisasterData) => {
  switch (disaster.severity) {
    case SeverityLevel.CRITICAL:
      return 'Seek shelter immediately and follow official instructions.';
    case SeverityLevel.HIGH:
      return 'Stay alert and prepare for possible evacuation.';
    case SeverityLevel.MEDIUM:
      return 'Stay informed and be prepared.';
    case SeverityLevel.LOW:
      return 'Monitor updates for changes.';
    default:
      return 'Check app for details.';
  }
};

/**
 * Add a notification response handler (mock)
 */
export const addNotificationResponseHandler = (handler: (response: any) => void) => {
  console.log('Mock: addNotificationResponseHandler called');
  // Return a mock subscription with an unsubscribe method
  return {
    remove: () => console.log('Mock: notification response handler removed')
  };
};

/**
 * Add a notification received handler (mock)
 */
export const addNotificationReceivedHandler = (handler: (notification: any) => void) => {
  console.log('Mock: addNotificationReceivedHandler called');
  // Return a mock subscription with an unsubscribe method
  return {
    remove: () => console.log('Mock: notification received handler removed')
  };
};

/**
 * Get all scheduled notifications (mock)
 */
export const getAllScheduledNotifications = async () => {
  console.log('Mock: getAllScheduledNotifications called');
  return [];
};

/**
 * Cancel all scheduled notifications (mock)
 */
export const cancelAllNotifications = async () => {
  console.log('Mock: cancelAllNotifications called');
};

const notificationService = {
  registerForPushNotifications,
  sendDisasterNotification,
  notifyNewDisaster,
  notifyDisasterUpdate,
  addNotificationResponseHandler,
  addNotificationReceivedHandler,
  getAllScheduledNotifications,
  cancelAllNotifications,
};

export default notificationService;
