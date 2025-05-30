import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

interface DonationSuccessModalProps {
  visible: boolean;
  amount: number;
  transactionId: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const DonationSuccessModal: React.FC<DonationSuccessModalProps> = ({
  visible,
  amount,
  transactionId,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.successIconContainer}>
            <LottieView
              source={require('../../assets/animations/donation-success.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
          
          <Text style={styles.thankYouText}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your donation of <Text style={styles.amountText}>Rs. {amount}</Text> has been successfully processed.
          </Text>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>{transactionId}</Text>
          </View>

          <Text style={styles.confirmationMessage}>
            A confirmation has been sent to your registered email and phone number.
          </Text>
          
          <Text style={styles.impactMessage}>
            Your generosity will help disaster victims rebuild their lives.
          </Text>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF5A5F', '#FF8A8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Share functionality would be implemented here
            }}
          >
            <Text style={styles.shareButtonText}>Share your contribution</Text>
            <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...shadows.large,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 150,
    height: 150,
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  amountText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 6,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confirmationMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  impactMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  closeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 6,
  },
});

export default DonationSuccessModal;
