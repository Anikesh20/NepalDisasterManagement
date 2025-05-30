import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'earthquake' | 'flood' | 'landslide' | 'fire' | 'general';
  steps?: string[];
  image?: any; // Replace with actual image type
}

export default function SafetyTipsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'earthquake', name: 'Earthquake', icon: 'pulse-outline' },
    { id: 'flood', name: 'Flood', icon: 'water-outline' },
    { id: 'landslide', name: 'Landslide', icon: 'earth-outline' },
    { id: 'fire', name: 'Fire', icon: 'flame-outline' },
    { id: 'general', name: 'General', icon: 'shield-outline' },
  ];

  const safetyTips: SafetyTip[] = [
    {
      id: 'earthquake-1',
      title: 'During an Earthquake',
      description: 'What to do when an earthquake strikes',
      icon: 'pulse-outline',
      color: '#F44336',
      category: 'earthquake',
      steps: [
        'Drop to the ground and take cover under a sturdy table or desk',
        'Hold on to the furniture and stay in place until the shaking stops',
        'Stay away from windows, glass, and heavy objects that could fall',
        'If you are outdoors, move to an open area away from buildings and power lines',
        'If you are in a vehicle, pull over to a safe location and stay inside',
      ],
    },
    {
      id: 'flood-1',
      title: 'Flood Preparedness',
      description: 'How to prepare for and stay safe during floods',
      icon: 'water-outline',
      color: '#2196F3',
      category: 'flood',
      steps: [
        'Know your area\'s flood risk and evacuation routes',
        'Prepare an emergency kit with essential supplies',
        'Move valuable items to higher ground',
        'Stay informed about weather conditions and flood warnings',
        'Never walk or drive through floodwaters',
      ],
    },
    {
      id: 'landslide-1',
      title: 'Landslide Safety',
      description: 'Recognizing and responding to landslide risks',
      icon: 'earth-outline',
      color: '#795548',
      category: 'landslide',
      steps: [
        'Be aware of landslide warning signs (cracks in ground, tilting trees)',
        'Stay away from steep slopes and areas with recent landslides',
        'Listen for unusual sounds that might indicate moving earth',
        'Have an evacuation plan ready',
        'Report any signs of potential landslides to authorities',
      ],
    },
    {
      id: 'fire-1',
      title: 'Fire Safety',
      description: 'Essential fire safety measures for your home',
      icon: 'flame-outline',
      color: '#FF9800',
      category: 'fire',
      steps: [
        'Install and maintain smoke detectors',
        'Create and practice a fire escape plan',
        'Keep flammable materials away from heat sources',
        'Learn how to use a fire extinguisher',
        'Know emergency numbers and evacuation procedures',
      ],
    },
    {
      id: 'general-1',
      title: 'Emergency Kit Essentials',
      description: 'What to include in your emergency preparedness kit',
      icon: 'shield-outline',
      color: '#4CAF50',
      category: 'general',
      steps: [
        'Water (1 gallon per person per day)',
        'Non-perishable food (3-day supply)',
        'First aid kit and medications',
        'Flashlight and extra batteries',
        'Important documents and cash',
        'Emergency contact numbers',
        'Basic tools and supplies',
      ],
    },
  ];

  const filteredTips = selectedCategory === 'all'
    ? safetyTips
    : safetyTips.filter(tip => tip.category === selectedCategory);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    setExpandedTip(null);
  };

  const handleTipPress = (tipId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  const renderCategoryButton = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton,
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Ionicons
        name={category.icon as any}
        size={20}
        color={selectedCategory === category.id ? '#fff' : colors.text}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.selectedCategoryButtonText,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTipCard = (tip: SafetyTip) => {
    const isExpanded = expandedTip === tip.id;

    return (
      <TouchableOpacity
        key={tip.id}
        style={styles.tipCard}
        onPress={() => handleTipPress(tip.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tipHeader}>
          <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
            <Ionicons name={tip.icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.textLight}
          />
        </View>

        {isExpanded && tip.steps && (
          <View style={styles.tipContent}>
            {tip.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: tip.color }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Tips</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Stay prepared and informed with these essential safety tips for various disaster scenarios.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => renderCategoryButton(category))}
        </ScrollView>

        <View style={styles.tipsContainer}>
          {filteredTips.map(tip => renderTipCard(tip))}
        </View>

        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color={colors.danger} />
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          </View>
          <Text style={styles.emergencyText}>
            In case of emergency, call the appropriate emergency services immediately:
          </Text>
          <View style={styles.emergencyContacts}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => router.push('/(dashboard)/emergency-contacts')}
            >
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text style={styles.emergencyButtonText}>View Emergency Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...shadows.small,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  categoriesContainer: {
    paddingRight: 16,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    ...shadows.small,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  selectedCategoryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  tipContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  emergencyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyContacts: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 