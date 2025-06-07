import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DisasterCard from '../components/DisasterCard';
import disasterService, { DisasterData, DisasterType } from '../services/disasterService';
import { colors } from '../styles/theme';

export default function AlertsScreen() {
  const router = useRouter();
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [filteredDisasters, setFilteredDisasters] = useState<DisasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<DisasterType | 'all'>('all');

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

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
          <Text style={styles.emptyText}>Loading disaster information...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleFilterChange(activeFilter)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredDisasters.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="information-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>
            {activeFilter === 'all'
              ? 'No active disasters found'
              : `No ${activeFilter} disasters found`}
          </Text>
          {activeFilter !== 'all' && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={styles.resetButtonText}>Show All Disasters</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
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

      <FlatList
        data={filteredDisasters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DisasterCard disaster={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
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
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});