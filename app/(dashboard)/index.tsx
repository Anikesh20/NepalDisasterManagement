import { Ionicons } from '@expo/vector-icons';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    interpolate,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import ALogoHeader from '../components/ALogoHeader';
import DisasterCard from '../components/DisasterCard';
import DonationCard from '../components/DonationCard';
import DonationSuccessModal from '../components/DonationSuccessModal';
import WeatherModal from '../components/WeatherModal';
import { logout } from '../services/authService';
import disasterService, { DisasterData } from '../services/disasterService';
import realTimeService from '../services/realTimeService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RH1RtLnm2eBVvTqnVeoBJepGyBj8cS0kFdlFgzwwcT66NRtDpyywesUqWZv08tfQQw3KlWPnqvrtBeq89ok5jXy00kkZ0iHlS';

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = 'a8fe3125fdca88ccbc2a42423a7e4a5d';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface MenuItem {
  title: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

interface QuickAction {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface DisasterUpdate {
  id: string;
  title: string;
  date: string;
  source: string;
  type: 'earthquake' | 'flood' | 'landslide' | 'fire' | 'other';
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
}

interface WeatherData {
  temperature: number;
  cityName: string;
  country: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
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

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [disasterUpdates, setDisasterUpdates] = useState<DisasterData[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [updatesError, setUpdatesError] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleDashboardScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
  };

  const handleContentSizeChange = (width: number, height: number) => {
    contentHeight.value = height;
  };

  const handleLayout = (event: any) => {
    scrollViewHeight.value = event.nativeEvent.layout.height;
  };

  const bottomPaddingStyle = useAnimatedStyle(() => {
    const isAtBottom = scrollY.value + scrollViewHeight.value >= contentHeight.value - 50;
    const padding = interpolate(
      scrollY.value,
      [contentHeight.value - scrollViewHeight.value - 100, contentHeight.value - scrollViewHeight.value],
      [0, 30],
      'clamp'
    );
    
    return {
      paddingBottom: withTiming(padding, { duration: 150 }),
    };
  });

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const response = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      setWeatherData({
        temperature: Math.round(data.main.temp),
        cityName: data.name,
        country: data.sys.country,
      });
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // Fetch weather data when location is obtained
        await fetchWeatherData(location.coords.latitude, location.coords.longitude);
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

  // Update useEffect to fetch weather data when location changes
  useEffect(() => {
    if (userLocation) {
      fetchWeatherData(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  // Add initial weather fetch on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

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

  const fetchDisasterUpdates = useCallback(async () => {
    try {
      setLoadingUpdates(true);
      setUpdatesError(null);
      const updates = await realTimeService.fetchLatestDisasters();
      setDisasterUpdates(updates);
    } catch (error: any) {
      console.error('Error fetching disaster updates:', error);
      setUpdatesError(error.message || 'Failed to fetch latest updates');
    } finally {
      setLoadingUpdates(false);
    }
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = realTimeService.subscribeToDisasterUpdates((updates) => {
      setDisasterUpdates(updates);
    });

    // Initial fetch
    fetchDisasterUpdates();

    // Start polling for updates
    const cleanup = realTimeService.startDisasterPolling();

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [fetchDisasterUpdates]);

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

  const handleDonation = async (amount: number, transactionId: string) => {
    try {
      // Show the success modal with the transaction ID
      setDonationAmount(amount);
      setTransactionId(transactionId);
      setDonationSuccessVisible(true);
    } catch (error) {
      console.error('Error handling donation:', error);
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

  const menuItems: MenuItem[] = [
    {
      title: 'My Profile',
      icon: 'person',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/profile');
      }
    },
    {
      title: 'Emergency Contacts',
      icon: 'call',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/emergency-contacts');
      }
    },
    {
      title: 'Disaster Map',
      icon: 'map',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/disaster-map');
      }
    },
    {
      title: 'Report Disaster',
      icon: 'warning',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/report-disaster');
      }
    },
    {
      title: 'Disaster Alerts',
      icon: 'alert',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/alerts');
      }
    },
    {
      title: 'Historical Data',
      icon: 'bar-chart',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/historical-data');
      }
    },
    {
      title: 'My Reports',
      icon: 'document-text',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/my-reports');
      }
    },
    {
      title: 'Volunteer Status',
      icon: 'people',
      onPress: () => {
        setMenuVisible(false);
        router.push('/(dashboard)/volunteer-status');
      }
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () => {
        setMenuVisible(false);
        router.push('/settings' as any);
      }
    },
    {
      title: 'Logout',
      icon: 'log-out',
      onPress: async () => {
        setMenuVisible(false);
        try {
          const { clearAuthState } = await import('../utils/authState');
          await clearAuthState();
          await logout();
          router.replace('/(auth)/LoginScreen');
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
    }
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

  // Add scroll handler for pagination
  const handleDisasterCardScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidth = 296; // card width + margin
    const index = Math.round(contentOffset / cardWidth);
    setActiveCardIndex(index);
  };

  // Render disaster cards section
  const renderDisastersSection = () => {
    if (loadingDisasters) {
      return (
        <View style={styles.disasterLoadingContainer}>
          <View style={styles.loadingSpinner}>
            <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: 0.7, marginLeft: 8 }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: 0.4, marginLeft: 8 }]} />
          </View>
          <Text style={styles.disasterLoadingText}>Loading disaster information...</Text>
        </View>
      );
    }

    if (disasterError) {
      return (
        <View style={styles.disasterErrorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          </View>
          <Text style={styles.disasterErrorText}>{disasterError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              fetchDisasters();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeDisasters.length === 0) {
      return (
        <View style={styles.noDisastersContainer}>
          <View style={styles.noDisastersIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
          </View>
          <Text style={styles.noDisastersText}>No active disasters in your area</Text>
          <Text style={styles.noDisastersSubtext}>Stay safe and stay prepared</Text>
        </View>
      );
    }

    return (
      <View style={styles.disasterCardsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.disasterCardsContainer}
          decelerationRate="fast"
          snapToInterval={296} // card width + margin
          snapToAlignment="start"
          onScroll={handleDisasterCardScroll}
          scrollEventThrottle={16}
          pagingEnabled
          bounces={false}
      >
        {activeDisasters.map((disaster, index) => (
          <Animated.View
            key={disaster.id}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.disasterCardWrapper}
          >
            <DisasterCard disaster={disaster} compact />
          </Animated.View>
        ))}
      </ScrollView>
        <View style={styles.disasterScrollIndicator}>
          {activeDisasters.map((_, index) => (
            <View
              key={index}
              style={[
                styles.scrollDot,
                index === activeCardIndex && styles.scrollDotActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#FF3B30', '#FF6B6B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMenuVisible(true);
              }}
            >
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeGreeting}>Hello,</Text>
                <Text style={styles.welcomeName}>User</Text>
              </View>
            </View>
            {weatherLoading ? (
              <View style={styles.weatherInfo}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : weatherData ? (
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
                <Text style={styles.location}>{weatherData.cityName}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.welcomeStats}>
            <View style={styles.statPill}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.statPillText}>Safe Zone</Text>
            </View>
            {weatherData && (
              <View style={styles.statPill}>
                <Ionicons name="location" size={16} color="#fff" />
                <Text style={styles.statPillText}>{weatherData.country}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.headerWave}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );

  const renderMenu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={menuVisible}
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable
        style={styles.menuOverlay}
        onPress={() => setMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <ALogoHeader size="small" />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.menuProfileSection}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.menuProfileImage} />
            ) : (
              <View style={styles.menuProfilePlaceholder}>
                <Ionicons name="person" size={32} color={colors.text} />
              </View>
            )}
            <Text style={styles.menuProfileText}>My Account</Text>
          </View>
          <ScrollView style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="#FF0000"
                      style={styles.menuIcon}
                    />
                  </View>
                  <Text style={styles.menuItemText}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const quickActions: QuickAction[] = [
    {
      title: 'Emergency Contacts',
      icon: 'call-outline',
      color: '#FF5A5F',
      onPress: () => router.push('/(dashboard)/emergency-contacts'),
    },
    {
      title: 'Disaster Map',
      icon: 'map-outline',
      color: '#3498DB',
      onPress: () => router.push('/(dashboard)/disaster-map'),
    },
    {
      title: 'Report Disaster',
      icon: 'warning-outline',
      color: '#E74C3C',
      onPress: () => router.push('/(dashboard)/report-disaster'),
    },
    {
      title: 'Disaster Alerts',
      icon: 'alert-outline',
      color: '#F39C12',
      onPress: () => router.push('/(dashboard)/alerts'),
    },
    {
      title: 'Historical Data',
      icon: 'bar-chart-outline',
      color: '#9B59B6',
      onPress: () => router.push('/(dashboard)/historical-data'),
    },
    {
      title: 'My Reports',
      icon: 'document-text-outline',
      color: '#1ABC9C',
      onPress: () => router.push('/(dashboard)/my-reports'),
    },
    {
      title: 'Weather',
      icon: 'partly-sunny-outline',
      color: '#2ECC71',
      onPress: handleWeatherPress,
    },
    {
      title: 'Volunteer Status',
      icon: 'people-outline',
      color: '#34495E',
      onPress: () => router.push('/(dashboard)/volunteer-status'),
    },
  ];

  const getUpdateIcon = (type: DisasterData['type']) => {
    switch (type) {
      case 'earthquake':
        return 'pulse-outline';
      case 'flood':
        return 'water-outline';
      case 'landslide':
        return 'earth-outline';
      case 'fire':
        return 'flame-outline';
      case 'avalanche':
        return 'snow-outline';
      case 'storm':
        return 'thunderstorm-outline';
      case 'drought':
        return 'sunny-outline';
      default:
        return 'alert-outline';
    }
  };

  const getSeverityColor = (severity: DisasterData['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return '#FF3B30';
      case 'HIGH':
        return '#FF9500';
      case 'MEDIUM':
        return '#FFCC00';
      case 'LOW':
        return '#34C759';
      default:
        return colors.primary;
    }
  };

  const renderUpdatesSection = () => {
    if (loadingUpdates) {
      return (
        <View style={styles.updatesLoadingContainer}>
          <View style={styles.loadingSpinner}>
            <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: 0.7, marginLeft: 8 }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: 0.4, marginLeft: 8 }]} />
          </View>
          <Text style={styles.updatesLoadingText}>Fetching latest updates...</Text>
        </View>
      );
    }

    if (updatesError) {
      return (
        <View style={styles.updatesErrorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          </View>
          <Text style={styles.updatesErrorText}>{updatesError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              fetchDisasterUpdates();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (disasterUpdates.length === 0) {
      return (
        <View style={styles.noUpdatesContainer}>
          <View style={styles.noUpdatesIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
          </View>
          <Text style={styles.noUpdatesText}>No active disasters</Text>
          <Text style={styles.noUpdatesSubtext}>All systems are normal</Text>
        </View>
      );
    }

    return (
      <>
        {disasterUpdates.map((update, index) => (
          <Animated.View
            key={update.id}
            entering={SlideInRight.delay(index * 100).duration(400)}
          >
            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(dashboard)/disaster-details',
                  params: { id: update.id }
                });
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.updateIconFloating, { backgroundColor: getSeverityColor(update.severity) }]}>
                <Ionicons name={getUpdateIcon(update.type)} size={24} color="#fff" />
              </View>
              <View style={styles.updateContent}>
                <View style={styles.updateHeader}>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(update.severity) + '20' }]}>
                    <Text style={[styles.severityText, { color: getSeverityColor(update.severity) }]}>
                      {update.severity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.updateLocation}>{update.location}, {update.district}</Text>
                <Text style={styles.updateDescription} numberOfLines={2}>
                  {update.description}
                </Text>
                <View style={styles.updateMeta}>
                  <Text style={styles.updateSource}>{update.type}</Text>
                  <Text style={styles.updateDate}>
                    {new Date(update.timestamp).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </>
    );
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, bottomPaddingStyle]}
          onScroll={handleDashboardScroll}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
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
            onScroll={handleDisasterCardScroll}
            scrollEventThrottle={16}
          >
            {quickActions.map((action: QuickAction, index: number) => (
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
                    <Ionicons name={action.icon as any} size={26} color="#fff" />
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
                  <Ionicons name="warning" size={20} color="#fff" />
                </View>
                <View>
                <Text style={styles.sectionTitle}>Active Disasters</Text>
                  <Text style={styles.sectionSubtitle}>
                    {activeDisasters.length} {activeDisasters.length === 1 ? 'disaster' : 'disasters'} reported
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(dashboard)/alerts' as any);
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
                <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(dashboard)/alerts' as any);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
            {renderUpdatesSection()}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
          >
            <DonationCard onDonate={handleDonation} />
          </Animated.View>
        </ScrollView>
        {renderMenu()}
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
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header styles
  headerContainer: {
    position: 'relative',
    marginBottom: 15,
    ...shadows.medium,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
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
    backgroundColor: '#fff',
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
    marginBottom: 20,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerRight: {
    width: 44, // Same width as menuButton to maintain balance
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 18,
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
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
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
  },
  // Disaster section styles
  disasterCardsWrapper: {
    marginTop: 8,
  },
  disasterCardsContainer: {
    paddingRight: 20,
    paddingBottom: 16,
    paddingLeft: 4, // Add some padding on the left for better visual balance
  },
  disasterCardWrapper: {
    marginRight: 16,
    width: 280, // Explicitly set width for better snap behavior
  },
  disasterLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  disasterLoadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  disasterErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disasterErrorText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDisastersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noDisastersIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noDisastersText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  noDisastersSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  disasterScrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
  scrollDotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  // Menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#fff',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.large,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...shadows.small,
    transform: [{ perspective: 1000 }, { rotateX: '5deg' }, { rotateY: '5deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(255, 0, 0, 0.15)',
  },
  menuIcon: {
    transform: [{ scale: 1.1 }],
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    opacity: 0.9,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuProfileSection: {
    padding: 20,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  menuProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  menuProfilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuProfileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  updatesLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  updatesLoadingText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12,
  },
  updatesErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  updatesErrorText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  noUpdatesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noUpdatesIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noUpdatesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  noUpdatesSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  updateCard: {
    padding: 16,
    marginBottom: 16,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateIconFloating: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...shadows.small,
  },
  updateContent: {
    flex: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  updateLocation: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  updateDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  updateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateSource: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  updateDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  weatherInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  temperature: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: -4,
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});