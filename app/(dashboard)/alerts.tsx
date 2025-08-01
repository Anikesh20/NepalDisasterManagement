import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DisasterAlertsFeed from '../components/DisasterAlertsFeed';
import { fetchAllDisasterAlerts } from '../services/disasterAlertsService';
import { colors } from '../styles/theme';

export default function AlertsScreen() {
  const router = useRouter();

  // Test notification handler
  const handleTestNotification = async () => {
    try {
      const lat = 27.7172; // Kathmandu default
      const lon = 85.3240;
      const alerts = await fetchAllDisasterAlerts(lat, lon);
      if (alerts && alerts.length > 0) {
        const latest = alerts[0];
        await Notifications.scheduleNotificationAsync({
          content: {
            title: latest.title || 'Latest Disaster Alert',
            body: latest.description || 'A new disaster alert has been issued.',
            sound: 'default',
          },
          trigger: null,
        });
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'No Disaster Alerts',
            body: 'There are currently no disaster alerts.',
            sound: 'default',
          },
          trigger: null,
        });
      }
    } catch (error) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Error',
          body: 'Failed to fetch latest disaster alert.',
          sound: 'default',
        },
        trigger: null,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Only one back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Disaster Alerts</Text>
        <TouchableOpacity onPress={handleTestNotification} style={styles.testButton}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.feedContainer} showsVerticalScrollIndicator={false}>
        <DisasterAlertsFeed showAll={true} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  testButton: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 8,
  },
  feedContainer: {
    padding: 16,
  },
});