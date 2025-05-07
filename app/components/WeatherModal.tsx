import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import weatherService, { WeatherData } from '../services/weatherService';
import { colors } from '../styles/theme';

interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
  onRequestPermission: () => Promise<void>;
  hasPermission: boolean | null;
}

export default function WeatherModal({ 
  visible, 
  onClose, 
  userLocation, 
  onRequestPermission,
  hasPermission 
}: WeatherModalProps) {
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && userLocation) {
      fetchWeather();
    }
  }, [visible, userLocation]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: WeatherData;

      if (searchCity) {
        data = await weatherService.getWeatherByCity(searchCity);
      } else if (userLocation) {
        data = await weatherService.getWeatherByCoords(userLocation.latitude, userLocation.longitude);
      } else {
        throw new Error('No location provided');
      }

      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
        return 'rainy';
      case 'snow':
        return 'snow';
      case 'thunderstorm':
        return 'thunderstorm';
      case 'drizzle':
        return 'water';
      case 'mist':
      case 'fog':
        return 'water';
      default:
        return 'partly-sunny';
    }
  };

  const renderContent = () => {
    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name="location-off" size={48} color={colors.textLight} />
          <Text style={styles.permissionText}>
            Location access is required to show weather for your area
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={onRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name="location" size={48} color={colors.textLight} />
          <Text style={styles.permissionText}>
            Requesting location permission...
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={searchCity}
            onChangeText={setSearchCity}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchWeather}
            disabled={loading}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {weatherData && (
          <View style={styles.weatherInfo}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.locationText}>{weatherData.location}</Text>
            </View>

            <View style={styles.temperatureContainer}>
              <Ionicons
                name={getWeatherIcon(weatherData.condition)}
                size={64}
                color={colors.primary}
              />
              <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
              <Text style={styles.condition}>{weatherData.condition}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={20} color={colors.textLight} />
                <Text style={styles.detailText}>{weatherData.humidity}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={20} color={colors.textLight} />
                <Text style={styles.detailText}>{weatherData.windSpeed} m/s</Text>
                <Text style={styles.detailLabel}>Wind</Text>
              </View>
            </View>
          </View>
        )}

        {!weatherData && !error && (
          <View style={styles.placeholder}>
            <Ionicons name="partly-sunny" size={48} color={colors.textLight} />
            <Text style={styles.placeholderText}>
              {userLocation
                ? 'Tap the search button to get weather for your location'
                : 'Enter a city name to get weather information'}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Weather Information</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    marginBottom: 20,
    textAlign: 'center',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    color: colors.text,
    marginLeft: 8,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
  },
  condition: {
    fontSize: 18,
    color: colors.textLight,
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
  permissionContainer: {
    alignItems: 'center',
    padding: 40,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 