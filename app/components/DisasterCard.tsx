import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DisasterData, getDisasterColor, getDisasterIcon, getSeverityColor } from '../services/disasterService';
import { colors, shadows } from '../styles/theme';

interface DisasterCardProps {
  disaster: DisasterData;
  compact?: boolean;
}

export default function DisasterCard({ disaster, compact = false }: DisasterCardProps) {
  const router = useRouter();
  
  // Format the timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handlePress = () => {
    router.push({
      pathname: '/(dashboard)/disaster-details',
      params: { id: disaster.id }
    });
  };

  if (compact) {
    // Compact card for dashboard
    return (
      <TouchableOpacity 
        style={[
          styles.compactCard, 
          { borderLeftColor: getDisasterColor(disaster.type) },
          shadows.small
        ]}
        onPress={handlePress}
      >
        <View style={[styles.iconContainer, { backgroundColor: getDisasterColor(disaster.type) + '20' }]}>
          <Ionicons name={getDisasterIcon(disaster.type)} size={24} color={getDisasterColor(disaster.type)} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{disaster.title}</Text>
          <View style={styles.compactMeta}>
            <Text style={styles.location} numberOfLines={1}>{disaster.location}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color={colors.textLight} style={styles.timeIcon} />
              <Text style={styles.time}>{formatTime(disaster.timestamp)}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disaster.severity) + '20' }]}>
            <Text style={[styles.severityText, { color: getSeverityColor(disaster.severity) }]}>
              {disaster.severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Full card for alerts screen
  return (
    <TouchableOpacity 
      style={[styles.card, shadows.medium]}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getDisasterColor(disaster.type) + '20' }]}>
          <Ionicons name={getDisasterIcon(disaster.type)} size={28} color={getDisasterColor(disaster.type)} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{disaster.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.location}>{disaster.location}, {disaster.district}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color={colors.textLight} style={styles.timeIcon} />
              <Text style={styles.time}>{formatTime(disaster.timestamp)}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disaster.severity) + '20' }]}>
          <Text style={[styles.severityText, { color: getSeverityColor(disaster.severity) }]}>
            {disaster.severity.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.description} numberOfLines={2}>{disaster.description}</Text>
        
        {(disaster.casualties !== undefined || disaster.evacuees !== undefined) && (
          <View style={styles.stats}>
            {disaster.casualties !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{disaster.casualties}</Text>
                <Text style={styles.statLabel}>Casualties</Text>
              </View>
            )}
            {disaster.evacuees !== undefined && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{disaster.evacuees}</Text>
                <Text style={styles.statLabel}>Evacuees</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Tap for more details</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact card styles (for dashboard)
  compactCard: {
    width: 200,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  compactMeta: {
    marginBottom: 8,
  },
  
  // Full card styles (for alerts screen)
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'column',
  },
  location: {
    fontSize: 12,
    color: colors.textLight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeIcon: {
    marginRight: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textLight,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  stat: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.background,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
  },
});
