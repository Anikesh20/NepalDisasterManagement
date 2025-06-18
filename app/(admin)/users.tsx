import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService, { UserData } from '../services/adminService';
import { colors } from '../styles/theme';
import useAdminOrientation from '../utils/useAdminOrientation';

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ensure landscape orientation
  useAdminOrientation();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('[UsersManagement] Attempting to load users...');
      const data = await adminService.getAllUsers();
      console.log('[UsersManagement] Users loaded successfully:', data);
      setUsers(data);
    } catch (error: any) {
      console.error('[UsersManagement] Error loading users:', error);
      console.error('[UsersManagement] Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert(
        'Error Loading Users',
        error.message || 'Failed to load users. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleViewUser = (user: UserData) => {
    Alert.alert(
      'User Details',
      `ID: ${user.id}\nName: ${user.full_name}\nEmail: ${user.email}\nPhone: ${user.phone_number}\nDistrict: ${user.district}\nBlood Group: ${user.blood_group || 'Not specified'}\nVolunteer: ${user.is_volunteer ? 'Yes' : 'No'}\nCreated: ${new Date(user.created_at).toLocaleDateString()}`
    );
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      width: 50,
    },
    {
      id: 'full_name',
      label: 'Name',
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      id: 'district',
      label: 'District',
      sortable: true,
    },
    {
      id: 'is_volunteer',
      label: 'Volunteer',
      render: (item: UserData) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.is_volunteer ? '#4CAF50' : '#9E9E9E' },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.is_volunteer ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
    },
    {
      id: 'created_at',
      label: 'Created',
      render: (item: UserData) => (
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      ),
      sortable: true,
    },
  ];

  const actions = [
    {
      icon: 'eye-outline' as const,
      label: 'View',
      onPress: handleViewUser,
      color: colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} users registered
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewUser}
          searchable
          searchKeys={['full_name', 'email', 'username', 'district']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={actions}
          emptyMessage="No users found"
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
