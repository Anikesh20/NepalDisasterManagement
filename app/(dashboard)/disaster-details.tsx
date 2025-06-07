import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import disasterService, { DisasterData, getDisasterColor, getDisasterIcon, getSeverityColor } from '../services/disasterService';
import { colors, shadows } from '../styles/theme';

export default function DisasterDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [disaster, setDisaster] = useState<DisasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisasterDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('No disaster ID provided');
          setLoading(false);
          return;
        }

        const data = await disasterService.getDisasterById(id);
        if (!data) {
          setError('Disaster not found');
        } else {
          setDisaster(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch disaster details');
        Alert.alert('Error', 'Failed to load disaster details');
      } finally {
        setLoading(false);
      }
    };

    fetchDisasterDetails();
  }, [id]);

  // Format the timestamp to a readable format
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }} />
        <Text style={styles.loadingText}>Loading disaster details...</Text>
      </View>
    );
  }

  if (error || !disaster) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Failed to load disaster details'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.disasterHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getDisasterColor(disaster.type) + '20' }]}>
            <Ionicons name={getDisasterIcon(disaster.type)} size={32} color={getDisasterColor(disaster.type)} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{disaster.title}</Text>
            <View style={styles.meta}>
              <Text style={styles.location}>{disaster.location}, {disaster.district}</Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={colors.textLight} style={styles.timeIcon} />
                <Text style={styles.time}>{formatDate(disaster.timestamp)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.severityContainer}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disaster.severity) + '20' }]}>
            <Text style={[styles.severityText, { color: getSeverityColor(disaster.severity) }]}>
              {disaster.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{disaster.description}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color={colors.textLight} />
            <Text style={styles.statValue}>{disaster.affectedPeople || 0}</Text>
            <Text style={styles.statLabel}>Affected</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="home-outline" size={20} color={colors.textLight} />
            <Text style={styles.statValue}>{disaster.damagedHouses || 0}</Text>
            <Text style={styles.statLabel}>Houses</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="medical-outline" size={20} color={colors.textLight} />
            <Text style={styles.statValue}>{disaster.injuredPeople || 0}</Text>
            <Text style={styles.statLabel}>Injured</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(dashboard)/emergency-contacts')}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Emergency Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/(dashboard)/volunteer-status')}
          >
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Volunteer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  disasterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  timeIcon: {
    marginRight: 4,
  },
  time: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  severityContainer: {
    marginBottom: 20,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...shadows.small,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  statsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...shadows.small,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
