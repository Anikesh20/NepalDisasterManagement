import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import disasterService, { DisasterData, DisasterType, getDisasterColor, getDisasterIcon } from '../services/disasterService';
import { colors, shadows } from '../styles/theme';

const { width, height } = Dimensions.get('window');

// Initial map region (centered on Nepal)
const INITIAL_REGION: Region = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

export default function DisasterMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [filteredDisasters, setFilteredDisasters] = useState<DisasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<DisasterType | 'all'>('all');
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterData | null>(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await disasterService.getActiveDisasters();
        setDisasters(data);
        setFilteredDisasters(data);
      } catch (err: any) {
        console.error('Error fetching disasters:', err);
        setError(err.message || 'Failed to fetch disaster data');
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, []);

  const handleFilterChange = (filter: DisasterType | 'all') => {
    setActiveFilter(filter);

    if (filter === 'all') {
      setFilteredDisasters(disasters);
    } else {
      const filtered = disasters.filter(disaster => disaster.type === filter);
      setFilteredDisasters(filtered);
    }
  };

  const handleMarkerPress = (disaster: DisasterData) => {
    setSelectedDisaster(disaster);

    // Animate to the selected disaster
    if (disaster.coordinates && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: disaster.coordinates.latitude,
        longitude: disaster.coordinates.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
    }
  };

  const handleViewDetails = (disaster: DisasterData) => {
    router.push({
      pathname: '/(dashboard)/disaster-details',
      params: { id: disaster.id }
    });
  };

  const renderFilterChip = (type: DisasterType | 'all', label: string) => {
    const isActive = activeFilter === type;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isActive && { backgroundColor: colors.primary }
        ]}
        onPress={() => handleFilterChange(type)}
      >
        <Text style={[
          styles.filterChipText,
          isActive && { color: '#fff' }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMarkers = () => {
    return filteredDisasters.map(disaster => {
      if (!disaster.coordinates) return null;

      return (
        <Marker
          key={disaster.id}
          coordinate={{
            latitude: disaster.coordinates.latitude,
            longitude: disaster.coordinates.longitude,
          }}
          onPress={() => handleMarkerPress(disaster)}
        >
          <View style={[
            styles.markerContainer,
            { backgroundColor: getDisasterColor(disaster.type) + '80' }
          ]}>
            <Ionicons
              name={getDisasterIcon(disaster.type)}
              size={20}
              color="#fff"
            />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{disaster.title}</Text>
              <Text style={styles.calloutLocation}>{disaster.location}, {disaster.district}</Text>
              <Text style={styles.calloutDescription} numberOfLines={2}>
                {disaster.description}
              </Text>
              <TouchableOpacity
                style={styles.calloutButton}
                onPress={() => handleViewDetails(disaster)}
              >
                <Text style={styles.calloutButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </Callout>
        </Marker>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by type:</Text>
        <View style={styles.filterChipsContainer}>
          {renderFilterChip('all', 'All')}
          {renderFilterChip(DisasterType.EARTHQUAKE, 'Earthquake')}
          {renderFilterChip(DisasterType.FLOOD, 'Flood')}
          {renderFilterChip(DisasterType.FIRE, 'Fire')}
          {renderFilterChip(DisasterType.LANDSLIDE, 'Landslide')}
          {renderFilterChip(DisasterType.STORM, 'Storm')}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
          <Text style={styles.loadingText}>Loading disaster information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleFilterChange(activeFilter)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
          >
            {renderMarkers()}
          </MapView>

          {selectedDisaster && (
            <View style={styles.selectedDisasterContainer}>
              <View style={styles.selectedDisasterContent}>
                <View style={[
                  styles.selectedDisasterIcon,
                  { backgroundColor: getDisasterColor(selectedDisaster.type) + '20' }
                ]}>
                  <Ionicons
                    name={getDisasterIcon(selectedDisaster.type)}
                    size={24}
                    color={getDisasterColor(selectedDisaster.type)}
                  />
                </View>
                <View style={styles.selectedDisasterInfo}>
                  <Text style={styles.selectedDisasterTitle}>{selectedDisaster.title}</Text>
                  <Text style={styles.selectedDisasterLocation}>
                    {selectedDisaster.location}, {selectedDisaster.district}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(selectedDisaster)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
