import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { updateVolunteerProfile } from '../services/userService';
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<Availability[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);

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

  useEffect(() => {
    // Simulate fetching volunteer status from backend
    // TODO: Fetch volunteer status and setPending(true) if status is 'pending'
  }, []);

  useEffect(() => {
    if (weeklyAvailability.length === 0) {
      setWeeklyAvailability([
        { day: 'Monday', available: true },
        { day: 'Tuesday', available: true },
        { day: 'Wednesday', available: false },
        { day: 'Thursday', available: true },
        { day: 'Friday', available: true },
        { day: 'Saturday', available: false },
        { day: 'Sunday', available: false },
      ]);
    }
  }, []);

  useEffect(() => {
    const fetchVolunteerStatus = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/volunteers/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setVolunteerStatus(data.status);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchVolunteerStatus();
  }, []);

  const handleStatusToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const handleAvailabilityToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAvailable(!isAvailable);
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAvailabilityChange = (index: number, value: boolean) => {
    setWeeklyAvailability(prev =>
      prev.map((item, i) => (i === index ? { ...item, available: value } : item))
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare weekly availability as JSON string
      const weeklyAvail = JSON.stringify(weeklyAvailability);
      // Get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('User not logged in.');
        setLoading(false);
        return;
      }
      await updateVolunteerProfile(userId, {
        skills: selectedSkills,
        availability: isAvailable ? 'Available' : 'Unavailable',
        profile_image: profileImage,
        weekly_availability: weeklyAvail,
      });
      setPending(true);
      alert('Volunteer profile submitted! Awaiting admin verification.');
    } catch (e) {
      alert('Failed to submit volunteer profile.');
    } finally {
      setLoading(false);
    }
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
        onValueChange={(value) => handleAvailabilityChange(index, value)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {volunteerStatus === 'active' && (
        <View style={{ backgroundColor: '#4CAF50', padding: 8, borderRadius: 8, margin: 16 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Verified Volunteer</Text>
        </View>
      )}
      {volunteerStatus === 'pending' && (
        <View style={{ backgroundColor: '#FFC107', padding: 8, borderRadius: 8, margin: 16 }}>
          <Text style={{ color: '#333', fontWeight: 'bold', textAlign: 'center' }}>Your volunteer profile is pending admin verification.</Text>
        </View>
      )}
      {volunteerStatus === 'inactive' && (
        <View style={{ backgroundColor: '#F44336', padding: 8, borderRadius: 8, margin: 16 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Your volunteer application was rejected.</Text>
        </View>
      )}
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
            {skills.map((skill, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.skillCard, selectedSkills.includes(skill.name) && { borderColor: colors.primary, borderWidth: 2 }]}
                onPress={() => handleSkillToggle(skill.name)}
              >
                <View style={[styles.skillIcon, { backgroundColor: skill.color }]}>
                  <Ionicons name={skill.icon as any} size={20} color="#fff" />
                </View>
                <Text style={styles.skillName}>{skill.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Availability</Text>
          <View style={styles.availabilityContainer}>
            {weeklyAvailability.map((item, index) => renderAvailabilityItem(item, index))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={colors.textLight} />
                <Text style={{ color: colors.textLight, marginTop: 8 }}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {profileImage && (
            <TouchableOpacity onPress={() => setProfileImage(null)} style={styles.removeImageBtn}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={{ color: '#F44336', marginLeft: 4 }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            As an active volunteer, you may be called upon during emergencies. Please keep your availability and contact information up to date.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.editButton, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading || pending}
        >
          <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>{loading ? 'Submitting...' : 'Submit Volunteer Profile'}</Text>
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
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
}); 