import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import donationService, { DonationHistory } from '../services/donationService';
import { colors, shadows } from '../styles/theme';

export default function MyDonationsScreen() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      const [history, total] = await Promise.all([
        donationService.getDonationHistory(),
        donationService.getTotalDonated()
      ]);
      console.log("MyDonationsScreen loadDonations – fetched donations:", history);
      console.log("MyDonationsScreen loadDonations – total donated:", total);
      setDonations(history);
      setTotalDonated(total);
    } catch (error) {
      console.error("MyDonationsScreen loadDonations – error:", error);
      Alert.alert(
        "Error Loading Donations",
        error instanceof Error ? error.message : "Failed to load your donation history. Please try again."
      );
      setDonations([]);
      setTotalDonated(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      default:
        return '#F44336';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#FF5A5F', '#FF8A8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="heart" size={32} color="#fff" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Your Donations</Text>
                <Text style={styles.headerSubtitle}>
                  Total Donated: Rs. {totalDonated}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Donations List */}
        <View style={styles.donationsContainer}>
          {donations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No donations yet</Text>
              <Text style={styles.emptySubtext}>
                Your donation history will appear here
              </Text>
            </View>
          ) : (
            donations.map((donation, index) => (
              <View key={donation.id} style={styles.donationCard}>
                <View style={styles.donationHeader}>
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationAmount}>
                      {donation.currency.toUpperCase()} {Math.round(donation.amount)}
                    </Text>
                    <Text style={styles.donationCampaign}>
                      {donation.campaign}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(donation.status) + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(donation.status) }
                      ]}
                    >
                      {donation.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.donationDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="card-outline"
                        size={16}
                        color={colors.textLight}
                      />
                      <Text style={styles.detailText}>
                        {donation.payment_method.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.textLight}
                      />
                      <Text style={styles.detailText}>
                        {formatDate(donation.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.transactionId}>
                      Transaction ID: {donation.payment_intent_id}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    ...shadows.medium,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  donationsContainer: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    ...shadows.small,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...shadows.small,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  donationCampaign: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  donationDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  transactionId: {
    fontSize: 12,
    color: colors.textLight,
    fontFamily: 'monospace',
  },
});
