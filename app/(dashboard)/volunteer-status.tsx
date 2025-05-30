import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

interface Skill {
  name: string;
  icon: string;
  color: string;
}

interface Availability {
  day: string;
  available: boolean;
}

export default function VolunteerStatusScreen() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const skills: Skill[] = [
    { name: 'First Aid', icon: 'medical-outline', color: '#F44336' },
    { name: 'Search & Rescue', icon: 'search-outline', color: '#2196F3' },
    { name: 'Emergency Response', icon: 'alert-outline', color: '#FF9800' },
    { name: 'Medical Training', icon: 'fitness-outline', color: '#4CAF50' },
    { name: 'Communication', icon: 'chatbubbles-outline', color: '#9C27B0' },
    { name: 'Logistics', icon: 'cube-outline', color: '#795548' },
  ];

  const availability: Availability[] = [
    { day: 'Monday', available: true },
    { day: 'Tuesday', available: true },
    { day: 'Wednesday', available: false },
    { day: 'Thursday', available: true },
    { day: 'Friday', available: true },
    { day: 'Saturday', available: false },
    { day: 'Sunday', available: false },
  ];

  const handleStatusToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const handleAvailabilityToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAvailable(!isAvailable);
  };

  const renderSkillCard = (skill: Skill, index: number) => (
    <View key={index} style={styles.skillCard}>
      <View style={[styles.skillIcon, { backgroundColor: skill.color }]}>
        <Ionicons name={skill.icon as any} size={20} color="#fff" />
      </View>
      <Text style={styles.skillName}>{skill.name}</Text>
    </View>
  );

  const renderAvailabilityItem = (item: Availability, index: number) => (
    <View key={index} style={styles.availabilityItem}>
      <Text style={styles.availabilityDay}>{item.day}</Text>
      <Switch
        value={item.available}
        onValueChange={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Handle availability toggle for specific day
        }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Volunteer Status</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Volunteer Status</Text>
              <Text style={styles.statusSubtitle}>
                {isActive ? 'Active' : 'Inactive'} • {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <View style={styles.statusToggle}>
              <Switch
                value={isActive}
                onValueChange={handleStatusToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityLabel}>Available for Emergency Response</Text>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Skills</Text>
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => renderSkillCard(skill, index))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Availability</Text>
          <View style={styles.availabilityContainer}>
            {availability.map((item, index) => renderAvailabilityItem(item, index))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            As an active volunteer, you may be called upon during emergencies. Please keep your availability and contact information up to date.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Navigate to edit profile
          }}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Edit Volunteer Profile</Text>
        </TouchableOpacity>
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
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  statusToggle: {
    marginLeft: 16,
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  availabilityLabel: {
    fontSize: 14,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: '1%',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  skillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  availabilityContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    ...shadows.small,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  availabilityDay: {
    fontSize: 14,
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...shadows.small,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...shadows.small,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 