import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import ALogoHeader from '../components/ALogoHeader';
import DisasterCard from '../components/DisasterCard';
import DonationCard from '../components/DonationCard';
import DonationSuccessModal from '../components/DonationSuccessModal';
import WeatherModal from '../components/WeatherModal';
import disasterService, { DisasterData } from '../services/disasterService';
import donationService from '../services/donationService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [weatherModalVisible, setWeatherModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [activeDisasters, setActiveDisasters] = useState<DisasterData[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [disasterError, setDisasterError] = useState<string | null>(null);

  // Donation state
  const [donationSuccessVisible, setDonationSuccessVisible] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to get weather information for your area.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  useEffect(() => {
    requestLocationPermission();

    // Fetch active disasters
    const fetchDisasters = async () => {
      try {
        setLoadingDisasters(true);
        setDisasterError(null);
        const disasters = await disasterService.getActiveDisasters();
        setActiveDisasters(disasters);
      } catch (error: any) {
        console.error('Error fetching disasters:', error);
        setDisasterError(error.message || 'Failed to fetch disaster data');
      } finally {
        setLoadingDisasters(false);
      }
    };

    fetchDisasters();
  }, []);

  const handleWeatherPress = () => {
    if (locationPermission === false) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location access in your device settings to get weather information for your area.',
        [{ text: 'OK' }]
      );
    } else {
      setWeatherModalVisible(true);
    }
  };

  const handleDonation = async (amount: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Show loading or processing state here if needed

      // Process the donation
      const response = await donationService.makeDonation(amount);

      if (response.success) {
        // Set the donation details for the success modal
        setDonationAmount(amount);
        setTransactionId(response.transactionId || '');

        // Show the success modal
        setDonationSuccessVisible(true);
      } else {
        // Handle failed donation
        Alert.alert('Donation Failed', response.message);
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      Alert.alert('Error', 'An error occurred while processing your donation. Please try again.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const quickActions = [
    {
      title: 'Emergency Contacts',
      icon: 'call-outline' as const,
      color: '#FF5A5F',
      onPress: () => router.push('/(dashboard)/emergency-contacts'),
    },
    {
      title: 'Disaster Map',
      icon: 'map-outline' as const,
      color: '#3498DB',
      onPress: () => router.push('/(dashboard)/disaster-map'),
    },
    {
      title: 'Report Disaster',
      icon: 'warning-outline' as const,
      color: '#E74C3C',
      onPress: () => router.push('/(dashboard)/report-disaster'),
    },
    {
      title: 'Disaster Alerts',
      icon: 'alert-outline' as const,
      color: '#F39C12',
      onPress: () => router.push('/(dashboard)/alerts'),
    },
    {
      title: 'Historical Data',
      icon: 'bar-chart-outline' as const,
      color: '#9B59B6',
      onPress: () => router.push('/(dashboard)/historical-data'),
    },
    {
      title: 'My Reports',
      icon: 'document-text-outline' as const,
      color: '#1ABC9C',
      onPress: () => router.push('/(dashboard)/my-reports'),
    },
    {
      title: 'Weather',
      icon: 'partly-sunny-outline' as const,
      color: '#2ECC71',
      onPress: handleWeatherPress,
    },
    {
      title: 'Volunteer Status',
      icon: 'people-outline' as const,
      color: '#34495E',
      onPress: () => router.push('/(dashboard)/volunteer-status'),
    },
  ];

  const stats = [
    { label: 'Preparedness Score', value: '85%', icon: 'shield-checkmark-outline' as const, color: '#4CAF50' },
    { label: 'Nearby Shelters', value: '3', icon: 'home-outline' as const, color: '#2196F3' },
    { label: 'Active Volunteers', value: '12', icon: 'people-outline' as const, color: '#FF9800' },
  ];

  const newsItems = [
    {
      title: 'Earthquake Preparedness Workshop',
      date: '2 hours ago',
      source: 'NDRRMA',
      icon: 'newspaper-outline' as const,
    },
    {
      title: 'New Emergency Shelters Added',
      date: '5 hours ago',
      source: 'Local News',
      icon: 'home-outline' as const,
    },
  ];

  // Render disaster cards section
  const renderDisastersSection = () => {
    if (loadingDisasters) {
      return (
        <View style={styles.disasterLoadingContainer}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary }} />
          <Text style={styles.disasterLoadingText}>Loading disaster information...</Text>
        </View>
      );
    }

    if (disasterError) {
      return (
        <View style={styles.disasterErrorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
          <Text style={styles.disasterErrorText}>{disasterError}</Text>
        </View>
      );
    }

    if (activeDisasters.length === 0) {
      return (
        <View style={styles.noDisastersContainer}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
          <Text style={styles.noDisastersText}>No active disasters in your area</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.disasterCardsContainer}
      >
        {activeDisasters.map((disaster, index) => (
          <Animated.View
            key={disaster.id}
            entering={FadeInDown.delay(index * 100)}
          >
            <DisasterCard disaster={disaster} compact />
          </Animated.View>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <ALogoHeader size="medium" />
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
                <Text style={styles.subtitle}>Stay safe, stay prepared</Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(dashboard)/profile');
                }}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileButtonImage} />
                ) : (
                  <View style={styles.profileButtonPlaceholder}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.headerWave}>
          <View style={styles.wave} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.quickActionsHeader}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(dashboard)/all-actions');
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScrollContainer}
        >
          {quickActions.map((action, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(index * 70).duration(400)}
            >
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  action.onPress();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconFloating, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={26} color="#fff" />
                </View>
                <Text style={[styles.actionText, { color: action.color }]}>{action.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        <Animated.View
          style={styles.cardSection}
          entering={FadeInUp.delay(300).duration(500)}
        >
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: colors.danger }]}>
                <Ionicons name="warning" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Active Disasters</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(dashboard)/alerts');
              }}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {renderDisastersSection()}
        </Animated.View>

        <Animated.View
          style={styles.cardSection}
          entering={FadeInUp.delay(400).duration(500)}
        >
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
                <Ionicons name="stats-chart" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Your Status</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(500 + index * 100)}
                style={styles.statCard}
              >
                <View style={[styles.statIconFloating, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={26} color="#fff" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={styles.cardSection}
          entering={FadeInUp.delay(500).duration(500)}
        >
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                <Ionicons name="newspaper" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Latest Updates</Text>
            </View>
          </View>
          {newsItems.map((item, index) => (
            <Animated.View
              key={index}
              entering={SlideInRight.delay(600 + index * 100).duration(400)}
            >
              <TouchableOpacity
                style={styles.newsCard}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.7}
              >
                <View style={[styles.newsIconFloating, { backgroundColor: colors.primary }]}>
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <View style={styles.newsMeta}>
                    <Text style={styles.newsSource}>{item.source}</Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.newsArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
        >
          <DonationCard onDonate={handleDonation} />
        </Animated.View>

        {/* Nearby Resources section removed as requested */}
      </View>

      <WeatherModal
        visible={weatherModalVisible}
        onClose={() => setWeatherModalVisible(false)}
        userLocation={userLocation || undefined}
        onRequestPermission={requestLocationPermission}
        hasPermission={locationPermission}
      />

      <DonationSuccessModal
        visible={donationSuccessVisible}
        amount={donationAmount}
        transactionId={transactionId}
        onClose={() => setDonationSuccessVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header styles
  headerContainer: {
    position: 'relative',
    marginBottom: 15,
    ...shadows.medium,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  headerWave: {
    height: 40,
    overflow: 'hidden',
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -25,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerContent: {
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.small,
  },
  profileButtonImage: {
    width: 44,
    height: 44,
    borderRadius: 15,
  },
  profileButtonPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content styles
  content: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  // Quick actions styles
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  quickActionsScrollContainer: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  actionCard: {
    width: 110,
    height: 110,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionIconFloating: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Section common styles
  cardSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 18,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...shadows.small,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  // Disaster section styles
  disasterCardsContainer: {
    paddingRight: 5,
  },
  disasterLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    ...shadows.small,
  },
  disasterLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.text,
  },
  disasterErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.danger + '10',
    borderRadius: 16,
    ...shadows.small,
  },
  disasterErrorText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.danger,
  },
  noDisastersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.success + '10',
    borderRadius: 16,
    ...shadows.small,
  },
  noDisastersText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.success,
  },
  // Stats section styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statIconFloating: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
  },
  // News section styles
  newsCard: {
    padding: 12,
    marginBottom: 16,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  newsIconFloating: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: '#fff',
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 10,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  newsArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Map section styles
  mapCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 10,
    ...shadows.medium,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  mapContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  mapIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  mapBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});