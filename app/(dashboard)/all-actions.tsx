import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

interface ActionItem {
  title: string;
  icon: string;
  color: string;
  description: string;
  onPress: () => void;
}

interface ActionCategory {
  id: string;
  title: string;
  icon: string;
  actions: ActionItem[];
}

export default function AllActionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('emergency');

  const actionCategories: ActionCategory[] = [
    {
      id: 'emergency',
      title: 'Emergency',
      icon: 'warning-outline',
      actions: [
        {
          title: 'Emergency Contacts',
          icon: 'call-outline',
          color: '#FF5A5F',
          description: 'Access important emergency contact numbers',
          onPress: () => router.push('/(dashboard)/emergency-contacts'),
        },
        {
          title: 'Report Disaster',
          icon: 'warning-outline',
          color: '#E74C3C',
          description: 'Report a new disaster in your area',
          onPress: () => router.push('/(dashboard)/reportDisaster'),
        },
        {
          title: 'Disaster Alerts',
          icon: 'alert-outline',
          color: '#F39C12',
          description: 'View all active disaster alerts',
          onPress: () => router.push('/(dashboard)/alerts'),
        },
        {
          title: 'Safety Tips',
          icon: 'information-circle-outline',
          color: '#00BCD4',
          description: 'Learn how to stay safe during disasters',
          onPress: () => router.push('/(dashboard)/safety-tips'),
        },
      ],
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      icon: 'eye-outline',
      actions: [
        {
          title: 'Disaster Map',
          icon: 'map-outline',
          color: '#3498DB',
          description: 'View active disasters on an interactive map',
          onPress: () => router.push('/(dashboard)/disaster-map'),
        },
        {
          title: 'Weather',
          icon: 'partly-sunny-outline',
          color: '#2ECC71',
          description: 'Check current weather conditions',
          onPress: () => router.push('/(dashboard)/weather'),
        },
        {
          title: 'Historical Data',
          icon: 'bar-chart-outline',
          color: '#9B59B6',
          description: 'Access historical disaster information',
          onPress: () => router.push('/(dashboard)/historical-data'),
        },
      ],
    },
    {
      id: 'personal',
      title: 'Personal',
      icon: 'person-outline',
      actions: [
        {
          title: 'My Reports',
          icon: 'document-text-outline',
          color: '#1ABC9C',
          description: 'View your submitted disaster reports',
          onPress: () => router.push('/(dashboard)/my-reports'),
        },
        {
          title: 'My Donations',
          icon: 'heart-outline',
          color: '#FF5A5F',
          description: 'See your donation history and details',
          onPress: () => router.push('/(dashboard)/my-donations'),
        },
        {
          title: 'Volunteer Status',
          icon: 'people-outline',
          color: '#34495E',
          description: 'View and update your volunteer status',
          onPress: () => router.push('/(dashboard)/volunteer-status'),
        },
        {
          title: 'Settings',
          icon: 'settings-outline',
          color: '#607D8B',
          description: 'Manage app settings and preferences',
          onPress: () => router.push('/(dashboard)/settings'),
        },
      ],
    },
  ];

  const activeCategory = actionCategories.find(cat => cat.id === activeTab);

  const renderTab = (category: ActionCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.tab,
        activeTab === category.id && styles.activeTab
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(category.id);
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={category.icon as any} 
        size={20} 
        color={activeTab === category.id ? colors.primary : colors.textLight} 
      />
      <Text style={[
        styles.tabText,
        activeTab === category.id && styles.activeTabText
      ]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  const renderActionCard = (action: ActionItem, index: number) => (
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
        <Ionicons name={action.icon as any} size={28} color="#fff" />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {actionCategories.map(renderTab)}
        </ScrollView>
      </View>

      {/* Content Area */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeCategory && (
          <View style={styles.actionsGrid}>
            {activeCategory.actions.map(renderActionCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    ...shadows.small,
  },
  tabScrollContent: {
    paddingHorizontal: 15,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '30',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
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
