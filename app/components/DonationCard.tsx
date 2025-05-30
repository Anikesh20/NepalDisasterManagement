import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import paymentService from '../services/paymentService';
import { colors, shadows } from '../styles/theme';

interface DonationCardProps {
  onDonate: (amount: number, transactionId: string) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ onDonate }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const predefinedAmounts = [100, 500, 1000, 5000];

  const handleAmountSelect = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    setCustomAmount(text);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const amount = selectedAmount || (customAmount ? parseInt(customAmount, 10) : 0);
      
      if (amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
        return;
      }

      setIsProcessing(true);

      // Create payment intent
      const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(amount);

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Nepal Disaster Management',
        style: 'automatic',
        defaultBillingDetails: {
          name: 'Donation',
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        throw new Error(presentError.message);
      }

      // Confirm payment
      const { success, paymentIntent } = await paymentService.confirmPayment(paymentIntentId);

      if (success && paymentIntent.status === 'succeeded') {
        onDonate(amount, paymentIntent.id);
        setSelectedAmount(null);
        setCustomAmount('');
        setExpanded(false);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'An error occurred while processing your payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.8}
        disabled={isProcessing}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Donate to Relief Fund</Text>
            <Text style={styles.headerSubtitle}>Support disaster victims</Text>
          </View>
        </View>
        <View style={styles.expandIconContainer}>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.text} 
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.contentTitle}>Select donation amount</Text>
          
          <View style={styles.amountsContainer}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmountButton,
                  isProcessing && styles.disabledButton
                ]}
                onPress={() => handleAmountSelect(amount)}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <Text 
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.selectedAmountText,
                    isProcessing && styles.disabledText
                  ]}
                >
                  Rs. {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Or enter custom amount:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>Rs.</Text>
              <TextInput
                style={styles.customAmountInput}
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                placeholder="Enter amount"
                keyboardType="number-pad"
                placeholderTextColor={colors.textLight}
                editable={!isProcessing}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.donateButton,
              (!selectedAmount && !customAmount) && styles.disabledButton,
              isProcessing && styles.processingButton
            ]}
            onPress={handleDonate}
            disabled={(!selectedAmount && !customAmount) || isProcessing}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF5A5F', '#FF8A8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.donateButtonGradient}
            >
              <Text style={styles.donateButtonText}>
                {isProcessing ? 'Processing...' : 'Donate Now'}
              </Text>
              {!isProcessing && <Ionicons name="arrow-forward" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  expandIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  amountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedAmountButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedAmountText: {
    color: colors.primary,
  },
  customAmountContainer: {
    marginBottom: 20,
  },
  customAmountLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  customAmountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  donateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  donateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  processingButton: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default DonationCard;
