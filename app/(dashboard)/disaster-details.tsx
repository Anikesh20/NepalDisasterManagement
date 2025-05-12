import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DisasterData, getDisasterColor, getDisasterIcon, getSeverityColor } from '../services/disasterService';
import disasterService from '../services/disasterService';
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
        <ActivityIndicator size="large" color={colors.primary} />
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disaster Details</Text>
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={[getDisasterColor(disaster.type) + '30', getDisasterColor(disaster.type) + '10']}
          style={styles.banner}
        >
          <View style={[styles.iconContainer, { backgroundColor: getDisasterColor(disaster.type) + '30' }]}>
            <Ionicons name={getDisasterIcon(disaster.type)} size={40} color={getDisasterColor(disaster.type)} />
          </View>
          <Text style={styles.title}>{disaster.title}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disaster.severity) + '20' }]}>
            <Text style={[styles.severityText, { color: getSeverityColor(disaster.severity) }]}>
              {disaster.severity.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{disaster.location}, {disaster.district}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Occurred</Text>
                <Text style={styles.infoValue}>{formatDate(disaster.timestamp)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="map-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Affected Area</Text>
                <Text style={styles.infoValue}>{disaster.affectedArea}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDate(disaster.updatedAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Impact</Text>
          <View style={styles.statsContainer}>
            {disaster.casualties !== undefined && (
              <View style={[styles.statCard, shadows.small]}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.danger + '20' }]}>
                  <Ionicons name="sad-outline" size={24} color={colors.danger} />
                </View>
                <Text style={styles.statValue}>{disaster.casualties}</Text>
                <Text style={styles.statLabel}>Casualties</Text>
              </View>
            )}
            
            {disaster.evacuees !== undefined && (
              <View style={[styles.statCard, shadows.small]}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="people-outline" size={24} color={colors.warning} />
                </View>
                <Text style={styles.statValue}>{disaster.evacuees}</Text>
                <Text style={styles.statLabel}>Evacuees</Text>
              </View>
            )}
            
            <View style={[styles.statCard, shadows.small]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="alert-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{disaster.isActive ? 'Active' : 'Resolved'}</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{disaster.description}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  banner: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
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
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...shadows.small,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  descriptionSection: {
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
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
