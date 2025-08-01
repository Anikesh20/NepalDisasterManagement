import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

// Cloudinary upload helper
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/domynr4ha/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'volunteer_profile_unsigned'; // Must match your unsigned preset name in Cloudinary dashboard

async function uploadImageToCloudinary(uri: string): Promise<string> {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  } as any);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: data,
  });
  const result = await res.json();
  console.log('Cloudinary upload response:', result); // Debug log
  if (!result.secure_url) throw new Error('Image upload failed');
  return result.secure_url;
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
  const [volunteerId, setVolunteerId] = useState<number | null>(null);
  const [hasVolunteerRecord, setHasVolunteerRecord] = useState<boolean>(true);
  const [volunteer, setVolunteer] = useState<any | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const skills: Skill[] = [
    { name: 'First Aid', icon: 'medical-outline', color: '#F44336' },
    { name: 'Search & Rescue', icon: 'search-outline', color: '#2196F3' },
    { name: 'Emergency Response', icon: 'alert-outline', color: '#FF9800' },
    { name: 'Medical Training', icon: 'fitness-outline', color: '#4CAF50' },
    { name: 'Communication', icon: 'chatbubbles-outline', color: '#9C27B0' },
    { name: 'Logistics', icon: 'cube-outline', color: '#795548' },
  ];

  const defaultWeeklyAvailability: Availability[] = [
    { day: 'Sunday', available: false },
    { day: 'Monday', available: true },
    { day: 'Tuesday', available: true },
    { day: 'Wednesday', available: false },
    { day: 'Thursday', available: true },
    { day: 'Friday', available: true },
    { day: 'Saturday', available: false },
  ];

  const availability: Availability[] = [...defaultWeeklyAvailability];

  useEffect(() => {
    // Simulate fetching volunteer status from backend
    // TODO: Fetch volunteer status and setPending(true) if status is 'pending'
  }, []);

  useEffect(() => {
    if (weeklyAvailability.length === 0) {
      setWeeklyAvailability(defaultWeeklyAvailability);
    }
  }, []);

  useEffect(() => {
    if (volunteer && volunteer.profile_image) {
      setProfileImage(volunteer.profile_image);
    }
  }, [volunteer]);

  useEffect(() => {
    if (volunteer && Array.isArray(volunteer.skills)) {
      setSelectedSkills(volunteer.skills);
    }
  }, [volunteer]);

  useEffect(() => {
    if (volunteer && volunteer.status) {
      setIsActive(volunteer.status === 'active');
      setIsAvailable(volunteer.status === 'active');
    }
  }, [volunteer]);

  useEffect(() => {
    if (volunteer && typeof volunteer.weekly_availability === 'string') {
      try {
        const parsed = JSON.parse(volunteer.weekly_availability);
        setWeeklyAvailability(Array.isArray(parsed) ? parsed : []);
      } catch {
        setWeeklyAvailability([]);
      }
    }
  }, [volunteer]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchVolunteerStatus = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        const url = `${API_BASE_URL}/api/volunteers/${userId}`;
        console.log('Fetching volunteer status for user:', userId, url);
        if (!userId) {
          setVolunteerStatus(null);
          setVolunteerId(null);
          setHasVolunteerRecord(false);
          return;
        }
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Volunteer status API response:', data);
            setVolunteer(data);
            setVolunteerStatus(data.status);
            setVolunteerId(data.id);
            setHasVolunteerRecord(true);
            setProfileImage(data.profile_image || null);
            setSelectedSkills(Array.isArray(data.skills) ? data.skills : []);
            setIsAvailable(data.status === 'active');
            try {
              const parsed = typeof data.weekly_availability === 'string' ? JSON.parse(data.weekly_availability) : data.weekly_availability;
              setWeeklyAvailability(Array.isArray(parsed) ? parsed : []);
            } catch {
              setWeeklyAvailability([]);
            }
            setIsEditing(false);
          } else {
            console.log('Volunteer status API error:', response.status);
            setVolunteerStatus(null);
            setVolunteerId(null);
            setHasVolunteerRecord(true);
          }
        } catch (e) {
          console.log('Network or fetch error:', e);
          setVolunteerStatus(null);
          setVolunteerId(null);
          setHasVolunteerRecord(true);
        }
      };
      fetchVolunteerStatus();
    }, [])
  );

  const handleStatusToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const handleAvailabilityToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not logged in');
      const newAvailable = !isAvailable;
      setIsAvailable(newAvailable);
      setPending(false);
      await updateVolunteerProfile(userId, { availability: newAvailable ? 'Available' : 'Unavailable' });
    } catch (e) {
      alert('Failed to update availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setPending(false);
  };

  const handleAvailabilityChange = (index: number, value: boolean) => {
    setWeeklyAvailability(prev =>
      prev.map((item, i) => (i === index ? { ...item, available: value } : item))
    );
    setPending(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoading(true);
      try {
        const cloudUrl = await uploadImageToCloudinary(result.assets[0].uri);
        setProfileImage(cloudUrl);
        setPending(false);
      } catch (e) {
        alert('Failed to upload image.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    // Validation: all fields required
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill.');
      return;
    }
    if (!profileImage) {
      alert('Please add a profile image.');
      return;
    }
    if (!weeklyAvailability.some(day => day.available)) {
      alert('Please select at least one day of weekly availability.');
      return;
    }
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
      // If profileImage is not a Cloudinary URL, upload it
      let imageUrl = profileImage;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = await uploadImageToCloudinary(imageUrl);
        setProfileImage(imageUrl);
      }
      await updateVolunteerProfile(userId, {
        skills: selectedSkills,
        availability: isAvailable ? 'Available' : 'Unavailable',
        profile_image: imageUrl,
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

  const handleEditProfile = () => {
    setIsEditing(true);
    if (weeklyAvailability.length === 0) {
      setWeeklyAvailability(defaultWeeklyAvailability);
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
        onValueChange={isEditing ? (value) => handleAvailabilityChange(index, value) : undefined}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
        disabled={!isEditing}
      />
    </View>
  );

  console.log('Current volunteerStatus:', volunteerStatus, 'volunteerId:', volunteerId, 'hasVolunteerRecord:', hasVolunteerRecord);

  return (
    <View style={styles.container}>
      {!AsyncStorage.getItem('userId') && (
        <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 8, margin: 16 }}>
          <Text style={{ color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
            User not logged in. Please log in to view your volunteer status.
          </Text>
        </View>
      )}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        {volunteer ? (
          <View style={{ alignItems: 'center' }}>
            <View style={{
              backgroundColor:
                volunteer.status === 'active' ? '#4CAF50' :
                volunteer.status === 'inactive' ? '#FFC107' : '#9E9E9E',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginBottom: 12,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {volunteer.status === 'active' ? 'VERIFIED' :
                 volunteer.status === 'inactive' ? 'UNDER REVIEW' :
                 volunteer.status.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {volunteer.status === 'active'
                ? 'You are a verified volunteer!'
                : volunteer.status === 'inactive'
                ? 'Your application is under review.'
                : 'Volunteer status: ' + volunteer.status}
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 16, color: '#888' }}>
            You are not registered as a volunteer.
          </Text>
        )}
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity style={styles.imagePicker} onPress={isEditing ? handlePickImage : undefined} activeOpacity={isEditing ? 0.7 : 1}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={colors.textLight} />
                <Text style={{ color: colors.textLight, marginTop: 8 }}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {profileImage && isEditing && (
            <TouchableOpacity onPress={() => setProfileImage(null)} style={styles.removeImageBtn}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={{ color: '#F44336', marginLeft: 4 }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
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
                value={volunteer && volunteer.status === 'active'}
                onValueChange={handleStatusToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
                disabled={volunteer && volunteer.status === 'active'}
              />
            </View>
          </View>
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityLabel}>Available for Emergency Response</Text>
            <Switch
              value={isAvailable}
              onValueChange={isEditing ? handleAvailabilityToggle : undefined}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
              disabled={!isEditing}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Skills</Text>
          <View style={styles.skillsContainer}>
            {isEditing ? (
              // Edit mode: show all skills and add option
              <>
                {skills.map((skill, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.skillCard, selectedSkills.includes(skill.name) && { borderColor: colors.primary, borderWidth: 2 }]}
                    onPress={() => handleSkillToggle(skill.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.skillIcon, { backgroundColor: skill.color }]}> 
                      <Ionicons name={skill.icon as any} size={20} color="#fff" />
                    </View>
                    <Text style={styles.skillName}>{skill.name}</Text>
                  </TouchableOpacity>
                ))}
                {selectedSkills.filter(s => !skills.some(skill => skill.name === s)).map((customSkill, idx) => (
                  <TouchableOpacity
                    key={`custom-${customSkill}`}
                    style={[styles.skillCard, { borderColor: colors.primary, borderWidth: 2 }]}
                    onPress={() => handleSkillToggle(customSkill)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.skillIcon, { backgroundColor: '#607D8B' }]}> 
                      <Ionicons name="add-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.skillName}>{customSkill}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              // View mode: show only registered skills
              [...new Set(selectedSkills.map(s => s.toLowerCase()))].map((skill, idx) => (
                <View key={idx} style={[styles.skillCard, { borderColor: colors.primary, borderWidth: 2 }]}> 
                  <View style={[styles.skillIcon, { backgroundColor: skills.find(s2 => s2.name.toLowerCase() === skill)?.color || '#607D8B' }]}> 
                    <Ionicons name={(skills.find(s2 => s2.name.toLowerCase() === skill)?.icon as any) || ('add-outline' as any)} size={20} color="#fff" />
                  </View>
                  <Text style={styles.skillName}>{skill}</Text>
                </View>
              ))
            )}
          </View>
          {isEditing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TextInput
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Add a new skill"
                style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, marginRight: 8 }}
                editable={isEditing}
              />
              <TouchableOpacity
                onPress={() => {
                  const skillToAdd = newSkill.trim();
                  if (
                    skillToAdd &&
                    !selectedSkills.map(s => s.toLowerCase()).includes(skillToAdd.toLowerCase())
                  ) {
                    setSelectedSkills([...selectedSkills, skillToAdd]);
                    setNewSkill('');
                  }
                }}
                style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8 }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {isEditing && (
            <Text style={{ color: colors.textLight, marginTop: 4 }}>Add skills</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Availability</Text>
          <View style={styles.availabilityContainer}>
            {isEditing ? (
              weeklyAvailability.map((item, index) => (
                <View key={index} style={styles.availabilityItem}>
                  <Text style={styles.availabilityDay}>{item.day}</Text>
                  <Switch
                    value={item.available}
                    onValueChange={(value) => handleAvailabilityChange(index, value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              ))
            ) : (
              weeklyAvailability.filter(item => item.available).map((item, index) => (
                <View key={index} style={styles.availabilityItem}>
                  <Text style={styles.availabilityDay}>{item.day}</Text>
                </View>
              ))
            )}
          </View>
          {isEditing && (
            <Text style={{ color: colors.textLight, marginTop: 4 }}>Add availability</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            As an active volunteer, you may be called upon during emergencies. Please keep your availability and contact information up to date.
          </Text>
        </View>

        {isEditing ? (
          <TouchableOpacity 
            style={[styles.editButton, loading && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading || pending}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>{loading ? 'Submitting...' : 'Submit Volunteer Profile'}</Text>
          </TouchableOpacity>
        ) : (
        <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.secondary }]} 
            onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        )}
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