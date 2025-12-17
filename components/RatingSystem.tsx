/**
 * =====================================================
 * MOTA RATING SYSTEM
 * =====================================================
 * 
 * Features:
 * - Smart feedback routing based on rating
 * - 1-3 Stars: Internal feedback to support
 * - 4-5 Stars: Redirect to App Store/Google Play
 * - Engagement-based trigger
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
  Platform,
  Linking,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#182952',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',
};

const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
};

// App Store URLs - Replace with your actual app IDs
const APP_STORE_URL = 'https://apps.apple.com/app/id1234567890?action=write-review';
const PLAY_STORE_URL = 'market://details?id=com.mota.app';
const PLAY_STORE_WEB_URL = 'https://play.google.com/store/apps/details?id=com.mota.app';


// =====================================================
// ENGAGEMENT TRACKER
// =====================================================
const ENGAGEMENT_STORAGE_KEY = '@mota_engagement';
const RATING_SHOWN_KEY = '@mota_rating_shown';
const RATING_COMPLETED_KEY = '@mota_rating_completed';

export const EngagementTracker = {
  // Track user actions
  async trackAction(action: string) {
    try {
      const data = await AsyncStorage.getItem(ENGAGEMENT_STORAGE_KEY);
      const engagement = data ? JSON.parse(data) : {
        sessionCount: 0,
        bookingsCount: 0,
        favoritesCount: 0,
        screenViews: 0,
        lastActive: null,
        firstUse: null,
      };

      // Update metrics based on action
      switch (action) {
        case 'session_start':
          engagement.sessionCount++;
          engagement.lastActive = new Date().toISOString();
          if (!engagement.firstUse) {
            engagement.firstUse = new Date().toISOString();
          }
          break;
        case 'booking_complete':
          engagement.bookingsCount++;
          break;
        case 'favorite_added':
          engagement.favoritesCount++;
          break;
        case 'screen_view':
          engagement.screenViews++;
          break;
      }

      await AsyncStorage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(engagement));
      return engagement;
    } catch (error) {
      console.error('Error tracking engagement:', error);
      return null;
    }
  },

  // Check if user is highly engaged
  async isHighlyEngaged(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ENGAGEMENT_STORAGE_KEY);
      if (!data) return false;

      const engagement = JSON.parse(data);
      
      // Criteria for high engagement:
      // - At least 5 sessions OR
      // - At least 1 booking OR
      // - At least 3 favorites OR
      // - At least 20 screen views
      const isEngaged = 
        engagement.sessionCount >= 5 ||
        engagement.bookingsCount >= 1 ||
        engagement.favoritesCount >= 3 ||
        engagement.screenViews >= 20;

      return isEngaged;
    } catch (error) {
      return false;
    }
  },

  // Check if rating has been shown recently
  async shouldShowRating(): Promise<boolean> {
    try {
      // Check if user already completed rating
      const completed = await AsyncStorage.getItem(RATING_COMPLETED_KEY);
      if (completed === 'true') return false;

      // Check last shown time
      const lastShown = await AsyncStorage.getItem(RATING_SHOWN_KEY);
      if (lastShown) {
        const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return false; // Don't show within 7 days
      }

      // Check engagement level
      return await this.isHighlyEngaged();
    } catch (error) {
      return false;
    }
  },

  // Mark rating as shown
  async markRatingShown() {
    await AsyncStorage.setItem(RATING_SHOWN_KEY, Date.now().toString());
  },

  // Mark rating as completed
  async markRatingCompleted() {
    await AsyncStorage.setItem(RATING_COMPLETED_KEY, 'true');
  },

  // Reset (for testing)
  async reset() {
    await AsyncStorage.multiRemove([
      ENGAGEMENT_STORAGE_KEY,
      RATING_SHOWN_KEY,
      RATING_COMPLETED_KEY,
    ]);
  },
};


// =====================================================
// STAR RATING COMPONENT
// =====================================================
const StarRating = ({ rating, onRatingChange, size = 40, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  const animatedValues = useRef(stars.map(() => new Animated.Value(1))).current;

  const handleStarPress = (star: number) => {
    if (readonly) return;
    
    // Animate the selected star
    Animated.sequence([
      Animated.timing(animatedValues[star - 1], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[star - 1], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onRatingChange(star);
  };

  return (
    <View style={starStyles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleStarPress(star)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: animatedValues[star - 1] }] }}>
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={size}
              color={rating >= star ? C.gold : C.textMuted}
            />
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const starStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
});


// =====================================================
// RATING MODAL (Main Component)
// =====================================================
export const RatingModal = ({
  visible,
  onClose,
  onSubmitFeedback,
  user,
}) => {
  const [step, setStep] = useState('rating'); // 'rating' | 'low_feedback' | 'high_feedback' | 'thank_you'
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [likedMost, setLikedMost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible]);

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleContinue = () => {
    if (rating === 0) {
      Alert.alert('Please Rate', 'Tap the stars to rate your experience');
      return;
    }

    if (rating <= 3) {
      // Low rating - show internal feedback form
      setStep('low_feedback');
    } else {
      // High rating - ask what they liked
      setStep('high_feedback');
    }
  };

  const handleSubmitLowFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Please Share', 'Tell us how we can improve');
      return;
    }

    setSubmitting(true);
    try {
      // Send to support backend
      await onSubmitFeedback({
        type: 'improvement',
        rating,
        feedback,
        userId: user?._id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
      });

      await EngagementTracker.markRatingCompleted();
      setStep('thank_you');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitHighFeedback = async () => {
    setSubmitting(true);
    try {
      // Save what they liked (optional)
      if (likedMost.trim()) {
        await onSubmitFeedback({
          type: 'positive',
          rating,
          feedback: likedMost,
          userId: user?._id,
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
        });
      }

      await EngagementTracker.markRatingCompleted();

      // Redirect to App Store / Play Store
      const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else if (Platform.OS === 'android') {
        await Linking.openURL(PLAY_STORE_WEB_URL);
      }

      onClose();
    } catch (error) {
      console.error('Error opening store:', error);
      Alert.alert('Thank You!', 'We appreciate your feedback!');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    EngagementTracker.markRatingShown();
    setStep('rating');
    setRating(0);
    setFeedback('');
    setLikedMost('');
    onClose();
  };

  const renderRatingStep = () => (
    <View style={ratingStyles.content}>
      <View style={ratingStyles.header}>
        <LinearGradient colors={G.gold} style={ratingStyles.iconWrap}>
          <Ionicons name="sparkles" size={32} color={C.bg} />
        </LinearGradient>
        <Text style={ratingStyles.title}>What do you think of MOTA?</Text>
        <Text style={ratingStyles.subtitle}>
          Your feedback helps us create a better experience
        </Text>
      </View>

      <View style={ratingStyles.ratingSection}>
        <StarRating rating={rating} onRatingChange={handleRatingSelect} size={44} />
        {rating > 0 && (
          <Text style={ratingStyles.ratingText}>
            {rating <= 2 ? 'We can do better' : 
             rating === 3 ? 'It\'s okay' :
             rating === 4 ? 'Pretty good!' : 'Excellent!'}
          </Text>
        )}
      </View>

      <View style={ratingStyles.footer}>
        <TouchableOpacity style={ratingStyles.laterBtn} onPress={handleClose}>
          <Text style={ratingStyles.laterText}>Maybe Later</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[ratingStyles.continueBtn, rating === 0 && ratingStyles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={rating === 0}
        >
          <LinearGradient 
            colors={rating > 0 ? G.gold : ['#555', '#444']} 
            style={ratingStyles.continueBtnGrad}
          >
            <Text style={ratingStyles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLowFeedbackStep = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={ratingStyles.content}
    >
      <View style={ratingStyles.header}>
        <View style={ratingStyles.feedbackIconWrap}>
          <Ionicons name="chatbubble-ellipses" size={32} color={C.gold} />
        </View>
        <Text style={ratingStyles.title}>How can we improve?</Text>
        <Text style={ratingStyles.subtitle}>
          We read every piece of feedback and use it to make MOTA better
        </Text>
      </View>

      <View style={ratingStyles.feedbackSection}>
        <View style={ratingStyles.currentRating}>
          <StarRating rating={rating} onRatingChange={() => {}} size={20} readonly />
        </View>

        <TextInput
          style={ratingStyles.feedbackInput}
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Tell us what we could do better..."
          placeholderTextColor={C.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          autoFocus
        />

        <View style={ratingStyles.quickTags}>
          {['Service', 'App Speed', 'Features', 'Design', 'Other'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                ratingStyles.quickTag,
                feedback.includes(tag) && ratingStyles.quickTagSelected,
              ]}
              onPress={() => setFeedback(prev => prev ? `${prev}, ${tag}` : tag)}
            >
              <Text style={[
                ratingStyles.quickTagText,
                feedback.includes(tag) && ratingStyles.quickTagTextSelected,
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={ratingStyles.footer}>
        <TouchableOpacity style={ratingStyles.laterBtn} onPress={() => setStep('rating')}>
          <Text style={ratingStyles.laterText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={ratingStyles.continueBtn}
          onPress={handleSubmitLowFeedback}
          disabled={submitting}
        >
          <LinearGradient colors={G.gold} style={ratingStyles.continueBtnGrad}>
            <Text style={ratingStyles.continueText}>
              {submitting ? 'Sending...' : 'Send Feedback'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderHighFeedbackStep = () => (
    <View style={ratingStyles.content}>
      <View style={ratingStyles.header}>
        <View style={ratingStyles.happyIconWrap}>
          <Ionicons name="heart" size={32} color="#fff" />
        </View>
        <Text style={ratingStyles.title}>We're glad you love MOTA!</Text>
        <Text style={ratingStyles.subtitle}>
          What did you like most? (Optional)
        </Text>
      </View>

      <View style={ratingStyles.feedbackSection}>
        <View style={ratingStyles.currentRating}>
          <StarRating rating={rating} onRatingChange={() => {}} size={20} readonly />
        </View>

        <View style={ratingStyles.likedOptions}>
          {[
            { id: 'booking', label: 'Easy Booking', icon: 'calendar' },
            { id: 'design', label: 'Beautiful Design', icon: 'color-palette' },
            { id: 'service', label: 'Great Service', icon: 'ribbon' },
            { id: 'features', label: 'Useful Features', icon: 'apps' },
            { id: 'speed', label: 'Fast & Smooth', icon: 'flash' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                ratingStyles.likedOption,
                likedMost === option.id && ratingStyles.likedOptionSelected,
              ]}
              onPress={() => setLikedMost(option.id)}
            >
              <Ionicons 
                name={option.icon as any} 
                size={24} 
                color={likedMost === option.id ? C.bg : C.gold} 
              />
              <Text style={[
                ratingStyles.likedOptionText,
                likedMost === option.id && ratingStyles.likedOptionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={ratingStyles.storeNotice}>
        <Ionicons name="storefront" size={18} color={C.textMuted} />
        <Text style={ratingStyles.storeNoticeText}>
          You'll be redirected to the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'} to leave a review
        </Text>
      </View>

      <View style={ratingStyles.footer}>
        <TouchableOpacity style={ratingStyles.laterBtn} onPress={() => setStep('rating')}>
          <Text style={ratingStyles.laterText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={ratingStyles.continueBtn}
          onPress={handleSubmitHighFeedback}
          disabled={submitting}
        >
          <LinearGradient colors={G.gold} style={ratingStyles.continueBtnGrad}>
            <Ionicons name="star" size={18} color={C.bg} />
            <Text style={ratingStyles.continueText}>
              {submitting ? 'Opening...' : 'Rate on Store'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderThankYouStep = () => (
    <View style={ratingStyles.content}>
      <View style={ratingStyles.thankYouSection}>
        <View style={ratingStyles.thankYouIcon}>
          <Ionicons name="checkmark-circle" size={80} color={C.success} />
        </View>
        <Text style={ratingStyles.thankYouTitle}>Thank You!</Text>
        <Text style={ratingStyles.thankYouText}>
          Your feedback has been sent to our team. We truly appreciate you taking the time to help us improve.
        </Text>
      </View>

      <TouchableOpacity style={ratingStyles.doneBtn} onPress={handleClose}>
        <LinearGradient colors={G.gold} style={ratingStyles.doneBtnGrad}>
          <Text style={ratingStyles.doneText}>Done</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={ratingStyles.overlay}>
        <Animated.View 
          style={[
            ratingStyles.modal,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              }],
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={ratingStyles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color={C.textMuted} />
          </TouchableOpacity>

          {step === 'rating' && renderRatingStep()}
          {step === 'low_feedback' && renderLowFeedbackStep()}
          {step === 'high_feedback' && renderHighFeedbackStep()}
          {step === 'thank_you' && renderThankYouStep()}
        </Animated.View>
      </View>
    </Modal>
  );
};


// =====================================================
// RATING PROMPT HOOK
// =====================================================
export const useRatingPrompt = () => {
  const [showRating, setShowRating] = useState(false);

  const checkAndShowRating = async () => {
    const shouldShow = await EngagementTracker.shouldShowRating();
    if (shouldShow) {
      setShowRating(true);
    }
  };

  const dismissRating = () => {
    setShowRating(false);
  };

  return {
    showRating,
    checkAndShowRating,
    dismissRating,
    trackAction: EngagementTracker.trackAction,
  };
};


// =====================================================
// STYLES
// =====================================================
const ratingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: C.bg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  happyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: C.card,
    borderRadius: 16,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.gold,
    marginTop: 12,
  },
  feedbackSection: {
    marginBottom: 20,
  },
  currentRating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    color: C.text,
    fontSize: 15,
    minHeight: 120,
    marginBottom: 12,
  },
  quickTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.cardLight,
    borderRadius: 20,
  },
  quickTagSelected: {
    backgroundColor: C.gold,
  },
  quickTagText: {
    fontSize: 13,
    color: C.textSec,
    fontWeight: '500',
  },
  quickTagTextSelected: {
    color: C.bg,
  },
  likedOptions: {
    gap: 10,
  },
  likedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  likedOptionSelected: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  likedOptionText: {
    fontSize: 15,
    color: C.text,
    fontWeight: '500',
  },
  likedOptionTextSelected: {
    color: C.bg,
  },
  storeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.cardLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  storeNoticeText: {
    fontSize: 12,
    color: C.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  laterBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  laterText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSec,
  },
  continueBtn: {
    flex: 2,
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  thankYouSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  thankYouIcon: {},
  thankYouTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    marginTop: 20,
  },
  thankYouText: {
    fontSize: 15,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  doneBtn: {
    marginTop: 20,
  },
  doneBtnGrad: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.bg,
  },
});


export default {
  RatingModal,
  StarRating,
  EngagementTracker,
  useRatingPrompt,
};
