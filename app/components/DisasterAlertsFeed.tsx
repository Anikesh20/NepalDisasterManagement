import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchAllDisasterAlerts } from '../services/disasterAlertsService';

interface Alert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

interface DisasterAlertsFeedProps {
  limit?: number;
  showAll?: boolean;
  onCountChange?: (count: number) => void;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const DisasterAlertsFeed: React.FC<DisasterAlertsFeedProps> = ({ limit = 5, showAll = false, onCountChange }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const prevAlertIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default to Kathmandu, Nepal if no location is available
  const lat = 27.7172;
  const lon = 85.3240;

  // Request notification permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  // Fetch alerts and handle notification logic
  const loadAlerts = async (notifyOnNew = false) => {
    try {
      setLoading(true);
      const data = await fetchAllDisasterAlerts(lat, lon);
      setAlerts(data);
      if (onCountChange) onCountChange(data.length);

      // Detect new alerts
      const newIds = new Set(data.map(a => a.title + a.pubDate));
      const prevIds = prevAlertIds.current;
      const isNew = [...newIds].some(id => !prevIds.has(id));
      if (notifyOnNew && isNew && data.length > 0) {
        // Find the new alerts
        const newAlerts = data.filter(a => !prevIds.has(a.title + a.pubDate));
        if (newAlerts.length > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Disaster Alert',
              body: newAlerts[0].title,
              data: { alert: newAlerts[0] },
            },
            trigger: null,
          });
        }
      }
      prevAlertIds.current = newIds;
    } catch (err) {
      console.error('Error loading disaster alerts:', err);
      setError('Failed to load disaster alerts.');
      if (onCountChange) onCountChange(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and set up interval
  useEffect(() => {
    loadAlerts(false);
    intervalRef.current = setInterval(() => {
      loadAlerts(true);
    }, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadAlerts(true);
    });
    return () => subscription.remove();
  }, []);

  if (loading) return <ActivityIndicator style={{ margin: 20 }} size="large" color="#007AFF" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const displayAlerts = showAll ? alerts : alerts.slice(0, limit);

  const handleCardPress = (alert: Alert) => {
    setSelectedAlert(alert);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAlert(null);
  };

  const handleOpenLink = (link: string) => {
    if (link) Linking.openURL(link);
  };

  return (
    <View style={styles.container}>
      {displayAlerts.length === 0 ? (
        <Text style={styles.empty}>No alerts at this time.</Text>
      ) : (
        displayAlerts.map((item, i) => (
          <TouchableOpacity
            style={styles.card}
            key={i}
            activeOpacity={0.85}
            onPress={() => handleCardPress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.source}>{item.source}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.pubDate).toLocaleString()}</Text>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          </TouchableOpacity>
        ))
      )}
      {/* Modal for full alert details */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedAlert?.title}</Text>
              <Text style={styles.modalSource}>{selectedAlert?.source} | {selectedAlert?.pubDate && new Date(selectedAlert.pubDate).toLocaleString()}</Text>
              <Text style={styles.modalDescription}>{selectedAlert?.description}</Text>
              {selectedAlert?.link ? (
                <TouchableOpacity style={styles.linkButton} onPress={() => handleOpenLink(selectedAlert.link)}>
                  <Text style={styles.linkButtonText}>View Full Report</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  source: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  error: { color: 'red', margin: 20, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  modalSource: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#444',
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DisasterAlertsFeed; 