import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService, { VolunteerData } from '../services/adminService';
import { colors } from '../styles/theme';

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      const data = await adminService.getAllVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      Alert.alert('Error', 'Failed to load volunteers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVolunteers();
    setRefreshing(false);
  };

  const handleViewVolunteer = (volunteer: VolunteerData) => {
    Alert.alert(
      'Volunteer Details',
      `ID: ${volunteer.id}\nUser ID: ${volunteer.user_id}\nName: ${volunteer.user_name}\nSkills: ${volunteer.skills.join(', ')}\nAvailability: ${volunteer.availability}\nStatus: ${volunteer.status}\nRegistered: ${new Date(volunteer.created_at).toLocaleDateString()}`
    );
  };

  const handleChangeStatus = (volunteer: VolunteerData, newStatus: 'active' | 'inactive') => {
    Alert.alert(
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Volunteer`,
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this volunteer?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // In a real app, this would call an API to update the volunteer status
            const updatedVolunteers = volunteers.map(v => 
              v.id === volunteer.id ? { ...v, status: newStatus } : v
            );
            setVolunteers(updatedVolunteers);
            Alert.alert('Success', `Volunteer has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
          },
        },
      ]
    );
  };

  const columns = [
    {
      id: 'user_name',
      label: 'Name',
      sortable: true,
    },
    {
      id: 'skills',
      label: 'Skills',
      render: (item: VolunteerData) => (
        <Text>{item.skills.join(', ')}</Text>
      ),
    },
    {
      id: 'availability',
      label: 'Availability',
      sortable: true,
      width: 120,
    },
    {
      id: 'status',
      label: 'Status',
      render: (item: VolunteerData) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { 
                backgroundColor: 
                  item.status === 'active' ? '#4CAF50' : 
                  item.status === 'pending' ? '#FFC107' : '#9E9E9E' 
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
      width: 100,
    },
    {
      id: 'created_at',
      label: 'Registered',
      render: (item: VolunteerData) => (
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      ),
      sortable: true,
      width: 100,
    },
  ];

  const getActions = (volunteer: VolunteerData) => {
    const baseActions = [
      {
        icon: 'eye-outline' as const,
        label: 'View',
        onPress: handleViewVolunteer,
        color: colors.primary,
      },
    ];

    if (volunteer.status === 'active') {
      return [
        ...baseActions,
        {
          icon: 'close-circle-outline' as const,
          label: 'Deactivate',
          onPress: (v: VolunteerData) => handleChangeStatus(v, 'inactive'),
          color: '#F44336',
        },
      ];
    } else {
      return [
        ...baseActions,
        {
          icon: 'checkmark-circle-outline' as const,
          label: 'Activate',
          onPress: (v: VolunteerData) => handleChangeStatus(v, 'active'),
          color: '#4CAF50',
        },
      ];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Management</Text>
        <Text style={styles.headerSubtitle}>
          {volunteers.filter(v => v.status === 'active').length} active volunteers
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={volunteers}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewVolunteer}
          searchable
          searchKeys={['user_name', 'skills']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={volunteers.length > 0 ? getActions(volunteers[0]) : []}
          emptyMessage="No volunteers found"
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
