import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  icon: string;
  color: string;
}

export default function EmergencyContactsScreen() {
  const router = useRouter();

  const emergencyContacts: EmergencyContact[] = [
    {
      name: 'Police',
      number: '100',
      description: 'Emergency police services',
      icon: 'shield-outline',
      color: '#2196F3',
    },
    {
      name: 'Ambulance',
      number: '102',
      description: 'Emergency medical services',
      icon: 'medical-outline',
      color: '#F44336',
    },
    {
      name: 'Fire Department',
      number: '101',
      description: 'Fire and rescue services',
      icon: 'flame-outline',
      color: '#FF9800',
    },
    {
      name: 'NDRRMA',
      number: '9851255831',
      description: 'National Disaster Risk Reduction and Management Authority',
      icon: 'warning-outline',
      color: '#E91E63',
    },
    {
      name: 'Nepal Red Cross',
      number: '014270650',
      description: 'Emergency humanitarian assistance',
      icon: 'heart-outline',
      color: '#E53935',
    },
    {
      name: 'Mountain Rescue',
      number: '014270650',
      description: 'Mountain and trekking emergencies',
      icon: 'trending-up-outline',
      color: '#795548',
    },
    {
      name: 'Tourist Police',
      number: '014247041',
      description: 'Tourist assistance and emergencies',
      icon: 'people-outline',
      color: '#009688',
    },
    {
      name: 'Women Helpline',
      number: '1145',
      description: 'Women and child protection services',
      icon: 'female-outline',
      color: '#9C27B0',
    },
  ];

  const handleCall = async (number: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Linking.openURL(`tel:${number}`);
    } catch (error) {
      console.error('Error making phone call:', error);
    }
  };

  const renderContactCard = (contact: EmergencyContact, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.contactCard}
      onPress={() => handleCall(contact.number)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: contact.color }]}>
        <Ionicons name={contact.icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
      </View>
      <View style={styles.callButton}>
        <Ionicons name="call" size={24} color={contact.color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Tap on any contact to call directly. Save these numbers for emergency situations.
          </Text>
        </View>

        {emergencyContacts.map((contact, index) => renderContactCard(contact, index))}

        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Important Note:</Text>
          <Text style={styles.noteText}>
            • These numbers are for emergency use only{'\n'}
            • Keep calm and provide clear information when calling{'\n'}
            • Follow the instructions given by emergency responders{'\n'}
            • If possible, share your exact location using GPS coordinates
          </Text>
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  callButton: {
    padding: 8,
  },
  noteContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    ...shadows.small,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
}); 