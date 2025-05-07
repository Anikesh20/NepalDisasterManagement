import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import WeatherModal from '../components/WeatherModal';
import { colors } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [weatherModalVisible, setWeatherModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

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
      title: 'Volunteer Status',
      icon: 'people-outline' as const,
      color: '#3498DB',
      onPress: () => router.push('/(dashboard)/volunteer-status'),
    },
    {
      title: 'Disaster Alerts',
      icon: 'alert-outline' as const,
      color: '#F39C12',
      onPress: () => router.push('/(dashboard)/alerts'),
    },
    {
      title: 'Weather',
      icon: 'partly-sunny-outline' as const,
      color: '#2ECC71',
      onPress: handleWeatherPress,
    },
  ];

  const weatherData = {
    temperature: '25°C',
    condition: 'Sunny',
    riskLevel: 'Low',
  };

  const newsItems = [
    {
      title: 'Earthquake Preparedness Workshop',
      date: '2 hours ago',
      source: 'NDRRMA',
    },
    {
      title: 'New Emergency Shelters Added',
      date: '5 hours ago',
      source: 'Local News',
    },
  ];

  const stats = [
    { label: 'Preparedness Score', value: '85%' },
    { label: 'Nearby Shelters', value: '3' },
    { label: 'Active Volunteers', value: '12' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.subtitle}>Stay safe, stay prepared</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(dashboard)/profile')}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileButtonImage} />
              ) : (
                <View style={styles.profileButtonPlaceholder}>
                  <Ionicons name="person-circle-outline" size={32} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <Text style={styles.temperature}>{weatherData.temperature}</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
          <View style={[styles.riskIndicator, { backgroundColor: colors.success }]}>
            <Text style={styles.riskText}>Risk Level: {weatherData.riskLevel}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(index * 100)}
            >
              <TouchableOpacity
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          {newsItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.newsCard}>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsSource}>{item.source}</Text>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Resources</Text>
          <TouchableOpacity style={styles.mapCard}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapText}>View Nearby Shelters & Resources</Text>
              <Ionicons name="map-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <WeatherModal
        visible={weatherModalVisible}
        onClose={() => setWeatherModalVisible(false)}
        userLocation={userLocation || undefined}
        onRequestPermission={requestLocationPermission}
        hasPermission={locationPermission}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileButtonImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileButtonPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  riskIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: width / 2 - 30,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: colors.primary,
    marginRight: 10,
  },
  newsDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  mapCard: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 