import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../../styles/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  onPress?: () => void;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon,
  color = colors.primary,
  onPress,
  isLoading = false,
  trend,
}: StatsCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        </View>
        
        <View style={styles.valueContainer}>
          {isLoading ? (
            <View style={styles.loadingPlaceholder} />
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}
          
          {trend && !isLoading && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={trend.isPositive ? 'arrow-up-outline' : 'arrow-down-outline'}
                size={16}
                color={trend.isPositive ? '#4CAF50' : '#F44336'}
              />
              <Text
                style={[
                  styles.trendValue,
                  { color: trend.isPositive ? '#4CAF50' : '#F44336' },
                ]}
              >
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    ...shadows.small,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingPlaceholder: {
    height: 24,
    width: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 2,
  },
});
