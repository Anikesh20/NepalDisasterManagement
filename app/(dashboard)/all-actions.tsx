import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function AllActionsScreen() {
  const router = useRouter();

  const allActions = [
    {
      title: 'Emergency Contacts',
      icon: 'call-outline' as const,
      color: '#FF5A5F',
      description: 'Access important emergency contact numbers',
      onPress: () => router.push('/(dashboard)/emergency-contacts'),
    },
    {
      title: 'Disaster Map',
      icon: 'map-outline' as const,
      color: '#3498DB',
      description: 'View active disasters on an interactive map',
      onPress: () => router.push('/(dashboard)/disaster-map'),
    },
    {
      title: 'Report Disaster',
      icon: 'warning-outline' as const,
      color: '#E74C3C',
      description: 'Report a new disaster in your area',
      onPress: () => router.push('/(dashboard)/report-disaster'),
    },
    {
      title: 'Disaster Alerts',
      icon: 'alert-outline' as const,
      color: '#F39C12',
      description: 'View all active disaster alerts',
      onPress: () => router.push('/(dashboard)/alerts'),
    },
    {
      title: 'Historical Data',
      icon: 'bar-chart-outline' as const,
      color: '#9B59B6',
      description: 'Access historical disaster information',
      onPress: () => router.push('/(dashboard)/historical-data'),
    },
    {
      title: 'My Reports',
      icon: 'document-text-outline' as const,
      color: '#1ABC9C',
      description: 'View your submitted disaster reports',
      onPress: () => router.push('/(dashboard)/my-reports'),
    },
    {
      title: 'Weather',
      icon: 'partly-sunny-outline' as const,
      color: '#2ECC71',
      description: 'Check current weather conditions',
      onPress: () => router.push('/(dashboard)/weather'),
    },
    {
      title: 'Volunteer Status',
      icon: 'people-outline' as const,
      color: '#34495E',
      description: 'View and update your volunteer status',
      onPress: () => router.push('/(dashboard)/volunteer-status'),
    },
    {
      title: 'Safety Tips',
      icon: 'information-circle-outline' as const,
      color: '#00BCD4',
      description: 'Learn how to stay safe during disasters',
      onPress: () => router.push('/(dashboard)/safety-tips'),
    },
    {
      title: 'Settings',
      icon: 'settings-outline' as const,
      color: '#607D8B',
      description: 'Manage app settings and preferences',
      onPress: () => router.push('/(dashboard)/settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionsGrid}>
          {allActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                action.onPress();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: width / 2 - 22,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.small,
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },
});
