import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService from '../services/adminService';
import { DisasterData, getDisasterIcon, getSeverityColor } from '../services/disasterService';
import { colors } from '../styles/theme';

export default function DisastersManagement() {
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDisasters();
  }, []);

  const loadDisasters = async () => {
    try {
      const data = await adminService.getAllDisasters();
      setDisasters(data);
    } catch (error) {
      console.error('Error loading disasters:', error);
      Alert.alert('Error', 'Failed to load disasters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDisasters();
    setRefreshing(false);
  };

  const handleViewDisaster = (disaster: DisasterData) => {
    Alert.alert(
      'Disaster Details',
      `ID: ${disaster.id}\nTitle: ${disaster.title}\nType: ${disaster.type}\nLocation: ${disaster.location}, ${disaster.district}\nSeverity: ${disaster.severity}\nDescription: ${disaster.description}\nCasualties: ${disaster.casualties || 0}\nEvacuees: ${disaster.evacuees || 0}\nActive: ${disaster.isActive ? 'Yes' : 'No'}\nTimestamp: ${new Date(disaster.timestamp).toLocaleString()}`
    );
  };

  // Format the timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const columns = [
    {
      id: 'type',
      label: 'Type',
      render: (item: DisasterData) => (
        <View style={styles.typeContainer}>
          <Ionicons name={getDisasterIcon(item.type)} size={20} color={colors.text} />
          <Text style={styles.typeText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
      ),
      sortable: true,
      width: 120,
    },
    {
      id: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      id: 'district',
      label: 'District',
      sortable: true,
      width: 100,
    },
    {
      id: 'severity',
      label: 'Severity',
      render: (item: DisasterData) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getSeverityColor(item.severity) },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
      width: 100,
    },
    {
      id: 'isActive',
      label: 'Status',
      render: (item: DisasterData) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.isActive ? '#4CAF50' : '#9E9E9E' },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.isActive ? 'ACTIVE' : 'RESOLVED'}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
      width: 100,
    },
    {
      id: 'timestamp',
      label: 'Date',
      render: (item: DisasterData) => (
        <Text>{formatTime(item.timestamp)}</Text>
      ),
      sortable: true,
      width: 180,
    },
  ];

  const actions = [
    {
      icon: 'eye-outline' as const,
      label: 'View',
      onPress: handleViewDisaster,
      color: colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Disaster Management</Text>
        <Text style={styles.headerSubtitle}>
          {disasters.filter(d => d.isActive).length} active disasters
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={disasters}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewDisaster}
          searchable
          searchKeys={['title', 'location', 'district', 'type']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={actions}
          emptyMessage="No disasters found"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  tableContainer: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 8,
    color: colors.text,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
