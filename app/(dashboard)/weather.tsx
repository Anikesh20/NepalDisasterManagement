import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = 'a8fe3125fdca88ccbc2a42423a7e4a5d'; // Replace with your actual API key
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
  cityName: string;
  country: string;
  sunrise: number;
  sunset: number;
  pressure: number;
  visibility: number;
}

interface ForecastData {
  day: string;
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  icon: string;
  precipitation: number;
}

interface WeatherAlert {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  icon: string;
  color: string;
}

// Helper function to convert OpenWeatherMap icon code to Ionicons name
const getWeatherIcon = (iconCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': 'sunny',
    '01n': 'moon',
    '02d': 'partly-sunny',
    '02n': 'cloudy-night',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'water',
    '50n': 'water',
  };
  return iconMap[iconCode] || 'partly-sunny';
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function WeatherScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Effect to handle refresh
  useEffect(() => {
    if (refresh) {
      fetchLocationAndWeather();
    }
  }, [refresh]);

  // Initial load effect
  useEffect(() => {
    fetchLocationAndWeather();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if location services are enabled
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        setError('Location services are disabled. Please enable location services to get weather information.');
        setLocationPermission(false);
        setLoading(false);
        return false;
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status !== 'granted') {
        setError('Location permission is required to show weather information. Please enable location access in your device settings.');
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      setError('Failed to request location permission');
      setLocationPermission(false);
      setLoading(false);
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      return location;
    } catch (err) {
      setError('Failed to get your current location. Please check your location settings and try again.');
      console.error('Error getting location:', err);
      return null;
    }
  };

  const fetchLocationAndWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      // Get current location
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        return;
      }

      // Fetch weather data using location
      await fetchWeatherData(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (err) {
      setError('Failed to get location or fetch weather information');
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherResponse.ok) {
        throw new Error(weatherData.message || 'Failed to fetch weather data');
      }

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      if (!forecastResponse.ok) {
        throw new Error(forecastData.message || 'Failed to fetch forecast data');
      }

      // Process current weather data
      const currentWeather: WeatherData = {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        icon: getWeatherIcon(weatherData.weather[0].icon),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        precipitation: weatherData.rain ? Math.round(weatherData.rain['1h'] * 100) : 0,
        feelsLike: Math.round(weatherData.main.feels_like),
        cityName: weatherData.name,
        country: weatherData.sys.country,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility / 1000, // Convert meters to kilometers
      };

      // Process forecast data
      const dailyForecasts = forecastData.list.reduce((acc: any[], item: any) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!acc.find((f: any) => f.day === day)) {
          acc.push({
            day,
            date: formatDate(item.dt),
            highTemp: Math.round(item.main.temp_max),
            lowTemp: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
            icon: getWeatherIcon(item.weather[0].icon),
            precipitation: item.rain ? Math.round(item.rain['3h'] * 100) : 0,
          });
        }
        return acc;
      }, []).slice(0, 5);

      // Check for weather alerts
      const alertsResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,daily&appid=${OPENWEATHER_API_KEY}`
      );
      const alertsData = await alertsResponse.json();

      const weatherAlerts: WeatherAlert[] = alertsData.alerts ? alertsData.alerts.map((alert: any) => ({
        type: alert.event,
        title: alert.event,
        description: alert.description,
        severity: alert.severity === 'Extreme' ? 'extreme' : 
                 alert.severity === 'Severe' ? 'high' : 
                 alert.severity === 'Moderate' ? 'moderate' : 'low',
        icon: alert.event.toLowerCase().includes('rain') ? 'rainy' :
              alert.event.toLowerCase().includes('storm') ? 'thunderstorm' :
              alert.event.toLowerCase().includes('snow') ? 'snow' :
              alert.event.toLowerCase().includes('wind') ? 'windy' : 'warning',
        color: alert.severity === 'Extreme' ? '#9C27B0' :
               alert.severity === 'Severe' ? '#F44336' :
               alert.severity === 'Moderate' ? '#FF9800' : '#4CAF50',
      })) : [];

      setWeather(currentWeather);
      setForecast(dailyForecasts);
      setAlerts(weatherAlerts);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setLoading(false);
      console.error('Error fetching weather:', err);
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'low':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'high':
        return '#F44336';
      case 'extreme':
        return '#9C27B0';
      default:
        return colors.primary;
    }
  };

  const renderWeatherCard = () => {
    if (!weather) return null;

    return (
      <View style={styles.weatherCard}>
        <View style={styles.locationInfo}>
          <Text style={styles.cityName}>{weather.cityName}</Text>
          <Text style={styles.country}>{weather.country}</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </View>

        <View style={styles.currentWeather}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{weather.temperature}°</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
          <Ionicons name={weather.icon as any} size={80} color={colors.primary} />
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetail}>
            <Ionicons name="water-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.humidity}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Ionicons name="speedometer-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
            <Text style={styles.detailLabel}>Wind</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Ionicons name="rainy-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.precipitation}%</Text>
            <Text style={styles.detailLabel}>Precip</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Ionicons name="thermometer-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.feelsLike}°</Text>
            <Text style={styles.detailLabel}>Feels Like</Text>
          </View>
        </View>

        <View style={styles.additionalDetails}>
          <View style={styles.additionalDetail}>
            <Ionicons name="sunny-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              {new Date(weather.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.detailLabel}>Sunrise</Text>
          </View>
          <View style={styles.additionalDetail}>
            <Ionicons name="moon-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              {new Date(weather.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.detailLabel}>Sunset</Text>
          </View>
          <View style={styles.additionalDetail}>
            <Ionicons name="speedometer-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.pressure} hPa</Text>
            <Text style={styles.detailLabel}>Pressure</Text>
          </View>
          <View style={styles.additionalDetail}>
            <Ionicons name="eye-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>{weather.visibility} km</Text>
            <Text style={styles.detailLabel}>Visibility</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderForecastItem = (item: ForecastData, index: number) => (
    <View key={index} style={styles.forecastItem}>
      <Text style={styles.forecastDay}>{item.day}</Text>
      <Text style={styles.forecastDate}>{item.date}</Text>
      <Ionicons name={item.icon as any} size={32} color={colors.primary} />
      <View style={styles.forecastTemps}>
        <Text style={styles.forecastHigh}>{item.highTemp}°</Text>
        <Text style={styles.forecastLow}>{item.lowTemp}°</Text>
      </View>
      <View style={styles.precipitationContainer}>
        <Ionicons name="water-outline" size={12} color={colors.textLight} />
        <Text style={styles.precipitationText}>{item.precipitation}%</Text>
      </View>
    </View>
  );

  const renderAlertCard = (alert: WeatherAlert, index: number) => (
    <View key={index} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons name={alert.icon as any} size={24} color={alert.color} />
        </View>
        <View style={styles.alertTitleContainer}>
          <Text style={styles.alertType}>{alert.type}</Text>
          <Text style={styles.alertTitle}>{alert.title}</Text>
        </View>
      </View>
      <Text style={styles.alertDescription}>{alert.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {locationPermission === null 
              ? 'Requesting location permission...'
              : locationPermission === false
              ? 'Please enable location access...'
              : 'Loading weather information...'}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name={locationPermission === false ? "location" : "alert-circle"} 
            size={64} 
            color={colors.danger} 
          />
          <Text style={styles.errorText}>{error}</Text>
          {locationPermission === false && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openSettings();
              }}
            >
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              fetchLocationAndWeather();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {weather && (
          <>
            {renderWeatherCard()}

            {alerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weather Alerts</Text>
                {alerts.map((alert, index) => renderAlertCard(alert, index))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5-Day Forecast</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forecastContainer}
              >
                {forecast.map((item, index) => renderForecastItem(item, index))}
              </ScrollView>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Weather information is updated every hour. Severe weather alerts are updated in real-time.
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weatherCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...shadows.medium,
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  condition: {
    fontSize: 18,
    color: colors.textLight,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  forecastContainer: {
    paddingRight: 16,
  },
  forecastItem: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    ...shadows.small,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  forecastDate: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  forecastTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  forecastLow: {
    fontSize: 16,
    color: colors.textLight,
  },
  precipitationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  precipitationText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...shadows.small,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertType: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  alertDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...shadows.small,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  settingsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    marginBottom: 16,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  country: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  additionalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 16,
  },
  additionalDetail: {
    alignItems: 'center',
  },
}); 