/* Updated Admin Donations Table (app/(admin)/donations.tsx) – now fetches from /api/payments/all via adminService.getAllDonations */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService, { DonationHistory } from '../services/adminService';
import { colors } from '../styles/theme';
import useAdminOrientation from '../utils/useAdminOrientation';

export default function DonationsManagement() {
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Ensure landscape orientation
  useAdminOrientation();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      // Fetches from /api/payments/all (admin endpoint) via adminService.getAllDonations
      const data = await adminService.getAllDonations();
      setDonations(data);
      
      // Calculate total amount (sum of completed donations)
      const total = data.reduce((sum, donation) => (donation.status === 'completed' ? sum + donation.amount : sum), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error loading donations:', error);
      Alert.alert('Error', 'Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    setRefreshing(false);
  };

  const handleViewDonation = (donation: DonationHistory) => {
    Alert.alert(
      'Donation Details',
      `ID: ${donation.id}\nAmount: Rs. ${donation.amount}\nDate: ${donation.date}\nStatus: ${donation.status}\nCampaign: ${donation.campaign}`
    );
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      width: 100,
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (item: DonationHistory) => (
        <Text style={styles.amountText}>Rs. {item.amount}</Text>
      ),
      sortable: true,
      width: 120,
    },
    {
      id: 'campaign',
      label: 'Campaign',
      sortable: true,
    },
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      width: 100,
    },
    {
      id: 'status',
      label: 'Status',
      render: (item: DonationHistory) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { 
                backgroundColor: 
                  item.status === 'completed' ? '#4CAF50' : 
                  item.status === 'pending' ? '#FFC107' : '#F44336' 
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
      width: 120,
    },
  ];

  const actions = [
    {
      icon: 'eye-outline' as const,
      label: 'View',
      onPress: handleViewDonation,
      color: colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Donation Management</Text>
        <Text style={styles.headerSubtitle}>
          Total donations: Rs. {totalAmount}
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={donations}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewDonation}
          searchable
          searchKeys={['id', 'campaign']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={actions}
          emptyMessage="No donations found"
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
  amountText: {
    fontWeight: 'bold',
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
