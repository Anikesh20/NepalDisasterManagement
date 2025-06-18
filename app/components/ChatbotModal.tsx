import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import chatbotService, { ChatMessage, ChatbotResponse } from '../services/chatbotService';
import { colors, shadows } from '../styles/theme';

const { width, height } = Dimensions.get('window');

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ visible, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your disaster management assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Animation values
  const modalScale = useSharedValue(0);
  const inputHeight = useSharedValue(50);
  const typingIndicatorOpacity = useSharedValue(0);
  const quickActionsOpacity = useSharedValue(1);

  // Reset function to clear all state
  const resetChatbot = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your disaster management assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setInputText('');
    setIsLoading(false);
    setSuggestions([]);
    setIsTyping(false);
    setShowQuickActions(true);
    inputHeight.value = 50;
    typingIndicatorOpacity.value = 0;
    quickActionsOpacity.value = 1;
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  };

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      quickActionsOpacity.value = withTiming(1, { duration: 500 });
    } else {
      modalScale.value = withTiming(0, { duration: 200 });
      quickActionsOpacity.value = withTiming(0, { duration: 200 });
      // Reset chatbot state when modal is closed
      resetChatbot();
    }
  }, [visible]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setSuggestions([]);
    setShowQuickActions(false);
    quickActionsOpacity.value = withTiming(0, { duration: 300 });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response: ChatbotResponse = await chatbotService.sendMessage(text);
      setIsTyping(true);
      typingIndicatorOpacity.value = withTiming(1, { duration: 300 });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      typingIndicatorOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleQuickQuestionPress = (question: string) => {
    sendMessage(question);
  };

  const handleInputFocus = () => {
    inputHeight.value = withSpring(60, { damping: 15, stiffness: 150 });
    setShowQuickActions(false);
    quickActionsOpacity.value = withTiming(0, { duration: 300 });
  };

  const handleInputBlur = () => {
    inputHeight.value = withSpring(50, { damping: 15, stiffness: 150 });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Animated.View
      entering={item.isUser ? SlideInRight.delay(100) : SlideInLeft.delay(100)}
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <LinearGradient
            colors={[colors.primary, colors.primary + '80']}
            style={styles.botAvatarGradient}
          >
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </LinearGradient>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.isUser ? styles.userTimestamp : styles.botTimestamp,
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <Animated.View entering={FadeInDown.delay(300)} style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>💡 You might also want to ask:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
          {suggestions.map((suggestion, index) => (
            <Animated.View key={index} entering={FadeInUp.delay(400 + index * 100)}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} style={styles.suggestionIcon} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const getQuickQuestionIcon = (question: string): keyof typeof Ionicons.glyphMap => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('earthquake')) return 'pulse-outline';
    if (lowerQuestion.includes('flood')) return 'water-outline';
    if (lowerQuestion.includes('emergency')) return 'call-outline';
    if (lowerQuestion.includes('first aid')) return 'medical-outline';
    if (lowerQuestion.includes('weather')) return 'partly-sunny-outline';
    if (lowerQuestion.includes('prepare')) return 'shield-checkmark-outline';
    return 'help-circle-outline';
  };

  const renderQuickQuestions = () => {
    const quickQuestions = chatbotService.getQuickQuestions();

    return (
      <Animated.View 
        style={[styles.quickQuestionsContainer, { opacity: quickActionsOpacity }]}
        entering={FadeInUp.delay(200)}
      >
        <Text style={styles.quickQuestionsTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickQuestionsList}>
          {quickQuestions.map((question, index) => (
            <Animated.View key={index} entering={FadeInUp.delay(300 + index * 100)}>
              <TouchableOpacity
                style={styles.quickQuestionListItem}
                onPress={() => handleQuickQuestionPress(question)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary + '10', colors.primary + '05']}
                  style={styles.quickQuestionItemGradient}
                >
                  <View style={styles.quickQuestionItemContent}>
                    <View style={styles.quickQuestionIconContainer}>
                      <Ionicons 
                        name={getQuickQuestionIcon(question)} 
                        size={20} 
                        color={colors.primary} 
                      />
                    </View>
                    <View style={styles.quickQuestionTextContainer}>
                      <Text style={styles.quickQuestionItemText}>
                        {question}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={colors.textLight} 
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animated.View 
        style={[styles.typingContainer, { opacity: typingIndicatorOpacity }]}
        entering={FadeIn}
      >
        <View style={styles.botAvatar}>
          <LinearGradient
            colors={[colors.primary, colors.primary + '80']}
            style={styles.botAvatarGradient}
          >
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </LinearGradient>
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={styles.header} entering={FadeInDown.delay(100)}>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.botAvatarLarge}>
                  <LinearGradient
                    colors={['#fff', '#f8f9fa']}
                    style={styles.botAvatarLargeGradient}
                  >
                    <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Disaster Assistant</Text>
                  <Text style={styles.headerSubtitle}>Your AI safety companion</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          />

          {/* Typing Indicator */}
          {renderTypingIndicator()}

          {/* Suggestions */}
          {renderSuggestions()}

          {/* Quick Questions */}
          {showQuickActions && messages.length <= 2 && renderQuickQuestions()}

          {/* Input */}
          <Animated.View style={[styles.inputContainer, inputAnimatedStyle, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about disaster safety..."
                placeholderTextColor={colors.textLight}
                multiline
                maxLength={500}
                editable={!isLoading}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={inputText.trim() && !isLoading ? [colors.primary, colors.primary + 'CC'] : [colors.border, colors.border]}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() && !isLoading ? "#fff" : colors.textLight}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    ...shadows.medium,
  },
  botAvatarLargeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  botAvatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  botMessageText: {
    color: colors.text,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: colors.textLight,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  typingBubble: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionsScroll: {
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 6,
  },
  suggestionIcon: {
    marginLeft: 4,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  quickQuestionsList: {
    paddingRight: 20,
  },
  quickQuestionListItem: {
    marginBottom: 12,
  },
  quickQuestionItemGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  quickQuestionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickQuestionIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.primary + '10',
  },
  quickQuestionTextContainer: {
    flex: 1,
  },
  quickQuestionItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    minHeight: 80,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 12,
    paddingVertical: 8,
    minHeight: 34,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});