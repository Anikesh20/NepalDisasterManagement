import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { colors, shadows } from '../styles/theme';

const { width, height } = Dimensions.get('window');

// Initial map region (centered on Nepal)
const INITIAL_REGION: Region = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

const GEOCODE_CACHE_KEY = 'geocodeCache';

async function loadGeocodeCache() {
  try {
    const cacheString = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
    return cacheString ? JSON.parse(cacheString) : {};
  } catch {
    return {};
  }
}

async function saveGeocodeCache(cache) {
  try {
    await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

let geocodeCache = {};

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  if (geocodeCache[location]) return geocodeCache[location];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NepalDisasterManagement/1.0 (contact@example.com)'
      }
    });
    const text = await response.text();
    if (text.trim().startsWith('<')) {
      console.warn('Nominatim returned HTML (rate limit or error) for', location);
      return null;
    }
    const data = JSON.parse(text);
    if (data.length > 0) {
      const coords = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      geocodeCache[location] = coords;
      await saveGeocodeCache(geocodeCache);
      return coords;
    }
  } catch (err) {
    console.warn('Geocoding failed for', location, err);
  }
  return null;
}

function extractLocationFromTitle(title: string): string {
  // Try to extract the location after 'at' or 'at ' in the title
  const match = title.match(/at (.+)/i);
  if (match && match[1]) return match[1].trim();
  // Fallback: return the whole title
  return title;
}

export default function DisasterMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [geocodedAlerts, setGeocodedAlerts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      geocodeCache = await loadGeocodeCache();
    })();
  }, []);

  // Fetch and geocode alerts every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchAndGeocodeAlerts = async () => {
        setLoading(true);
        setError(null);
        try {
          const { fetchBipadAlerts } = await import('../services/disasterAlertsService');
          const data = await fetchBipadAlerts();
          setAlerts(data);
          const geocoded = await Promise.all(
            data.map(async (alert) => {
              if (alert.point && alert.point.coordinates) {
                return { ...alert, latitude: alert.point.coordinates[1], longitude: alert.point.coordinates[0] };
              }
              const locationName = extractLocationFromTitle(alert.title);
              const coords = await geocodeLocation(locationName);
              if (coords) {
                return { ...alert, latitude: coords.latitude, longitude: coords.longitude };
              }
              return null;
            })
          );
          if (isActive) setGeocodedAlerts(geocoded.filter(Boolean));
        } catch (err: any) {
          if (isActive) setError(err.message || 'Failed to fetch alert data');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchAndGeocodeAlerts();
      return () => { isActive = false; };
    }, [])
  );

  const renderMarkers = () =>
    geocodedAlerts.map((alert, idx) => (
      <Marker
        key={idx}
        coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}
        pinColor={alert.source === 'dhm' ? '#1976D2' : '#E53935'}
      >
        <Callout tooltip>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, minWidth: 240 }}>
            <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16, marginBottom: 2 }}>{alert.title}</Text>
            <Text style={{ color: '#333', fontSize: 13, marginBottom: 2 }}>{alert.pubDate ? new Date(alert.pubDate).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) : ''} (NPT)</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Basin:</Text>
            <Text>{alert.description?.match(/Basin:([^\\n]+)/)?.[1]?.trim() || '-'}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Station Name:</Text>
            <Text>{extractLocationFromTitle(alert.title)}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 4 }}>WATER LEVEL</Text>
            <Text>{alert.description?.match(/Water level:([^\\n]+)/)?.[1]?.trim() || '-'}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Source:</Text>
            <Text>{alert.source}</Text>
            {/* Show all other fields for debugging */}
            {Object.entries(alert).map(([key, value]) => (
              ['title', 'pubDate', 'description', 'point', 'source', 'latitude', 'longitude'].includes(key) ? null : (
                <View key={key} style={{ marginTop: 2 }}>
                  <Text style={{ fontWeight: 'bold' }}>{key}:</Text>
                  <Text selectable style={{ fontSize: 12 }}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                </View>
              )
            ))}
          </View>
        </Callout>
      </Marker>
    ));

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading alert locations...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{ latitude: 28.3949, longitude: 84.124, latitudeDelta: 5, longitudeDelta: 5 }}
        >
          {renderMarkers()}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  calloutContainer: {
    width: width * 0.6,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    ...shadows.medium,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  calloutLocation: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  calloutDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  calloutButton: {
    backgroundColor: colors.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  calloutButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedDisasterContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    ...shadows.medium,
  },
  selectedDisasterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDisasterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDisasterInfo: {
    flex: 1,
  },
  selectedDisasterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  selectedDisasterLocation: {
    fontSize: 14,
    color: colors.textLight,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
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
    padding: 20,
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
});
