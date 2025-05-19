import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import StatsCard from '../components/admin/StatsCard';
import adminService, { AdminStats } from '../services/adminService';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Import the auth state utility
              const { clearAuthState } = await import('../utils/authState');

              // Clear all authentication state
              await clearAuthState();

              // Navigate to login screen
              router.replace('/(auth)/LoginScreen');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const adminModules = [
    {
      title: 'User Management',
      icon: 'people',
      color: '#3498DB',
      description: 'Manage user accounts and profiles',
      onPress: () => router.push('/(admin)/users'),
    },
    {
      title: 'Disaster Management',
      icon: 'warning',
      color: '#E74C3C',
      description: 'Manage active and historical disasters',
      onPress: () => router.push('/(admin)/disasters'),
    },
    {
      title: 'Report Management',
      icon: 'document-text',
      color: '#F39C12',
      description: 'Review and verify user-submitted reports',
      onPress: () => router.push('/(admin)/reports'),
    },
    {
      title: 'Donation Management',
      icon: 'cash',
      color: '#2ECC71',
      description: 'Track donations and campaigns',
      onPress: () => router.push('/(admin)/donations'),
    },
    {
      title: 'Volunteer Management',
      icon: 'people-circle',
      color: '#9B59B6',
      description: 'Manage volunteer registrations and assignments',
      onPress: () => router.push('/(admin)/volunteers'),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { marginTop: 10 }]} // Add top margin to avoid status bar overlap
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Nepal Disaster Management</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="people"
            color="#3498DB"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/users')}
          />
          <StatsCard
            title="Total Volunteers"
            value={stats?.totalVolunteers || 0}
            icon="people-circle"
            color="#9B59B6"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/volunteers')}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Active Disasters"
            value={stats?.activeDisasters || 0}
            icon="warning"
            color="#E74C3C"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/disasters')}
          />
          <StatsCard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            icon="document-text"
            color="#F39C12"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/reports')}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Total Donations"
            value={stats?.totalDonations || 0}
            icon="cash"
            color="#2ECC71"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/donations')}
          />
          <StatsCard
            title="Donation Amount"
            value={`Rs. ${stats?.totalDonationAmount || 0}`}
            icon="wallet"
            color="#1ABC9C"
            isLoading={isLoading}
            onPress={() => router.push('/(admin)/donations')}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Admin Modules</Text>

      <View style={styles.modulesContainer}>
        {adminModules.map((module, index) => (
          <TouchableOpacity
            key={index}
            style={styles.moduleCard}
            onPress={module.onPress}
          >
            <View style={[styles.moduleIconContainer, { backgroundColor: module.color }]}>
              <Ionicons name={module.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.moduleContent}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
        >
          <View style={[styles.moduleIconContainer, { backgroundColor: '#E74C3C' }]}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.moduleTitle}>Logout</Text>
            <Text style={styles.moduleDescription}>Sign out from admin panel</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  modulesContainer: {
    marginBottom: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...shadows.small,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E74C3C20',
    ...shadows.small,
  },
});
