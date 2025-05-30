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
          { borderLeftColor: getDisasterColor(disaster.type) }
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactCardContent}>
          <View style={[styles.iconContainer, { backgroundColor: getDisasterColor(disaster.type) + '15' }]}>
            <Ionicons name={getDisasterIcon(disaster.type)} size={28} color={getDisasterColor(disaster.type)} />
          </View>
          <View style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <Text style={styles.compactTitle} numberOfLines={1}>{disaster.title}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(disaster.severity) + '15' }]}>
                <Text style={[styles.severityText, { color: getSeverityColor(disaster.severity) }]}>
                  {disaster.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.compactMeta}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={colors.textLight} style={styles.metaIcon} />
                <Text style={styles.location} numberOfLines={1}>{disaster.location}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} style={styles.metaIcon} />
                <Text style={styles.time}>{formatTime(disaster.timestamp)}</Text>
              </View>
            </View>
            {(disaster.casualties !== undefined || disaster.evacuees !== undefined) && (
              <View style={styles.compactStats}>
                {disaster.casualties !== undefined && (
                  <View style={styles.compactStat}>
                    <Ionicons name="sad-outline" size={14} color={colors.danger} style={styles.metaIcon} />
                    <Text style={[styles.compactStatText, { color: colors.danger }]}>{disaster.casualties}</Text>
                  </View>
                )}
                {disaster.evacuees !== undefined && (
                  <View style={styles.compactStat}>
                    <Ionicons name="people-outline" size={14} color={colors.warning} style={styles.metaIcon} />
                    <Text style={[styles.compactStatText, { color: colors.warning }]}>{disaster.evacuees}</Text>
                  </View>
                )}
              </View>
            )}
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
    width: 280,
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  compactCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  compactMeta: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 13,
    color: colors.textLight,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
    color: colors.textLight,
  },
  compactStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  compactStatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'column',
  },
  timeIcon: {
    marginRight: 4,
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
