/**
 * Detail Screen
 * View details and book restaurants, events, activities, lodging
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Image, ScrollView,
  KeyboardAvoidingView, Platform, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from '../constants/theme';
import api from '../services/api';

interface Props {
  item: any;
  type: 'restaurant' | 'event' | 'activity' | 'lodging' | 'nightlife';
  onBack: () => void;
}

export default function DetailScreen({ item, type, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Booking form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');

  const getImageUrl = () => {
    if (item.images && item.images.length > 0) {
      const primary = item.images.find((img: any) => img.isPrimary);
      return primary?.url || item.images[0].url;
    }
    return item.image || PLACEHOLDER_IMAGE;
  };

  const handleBook = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a reservation.');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        type,
        itemId: item._id || item.id,
        itemName: item.name,
        date,
        time: time || 'TBD',
        guests: parseInt(guests) || 2,
        notes,
        userId: user._id,
      };

      await api.post('/reservations', reservationData);
      
      Alert.alert(
        'Reservation Confirmed!',
        `Your ${type} reservation at ${item.name} has been confirmed for ${date}.`,
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to make reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to RSVP.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/events/${item._id}/rsvp`);
      Alert.alert(
        'RSVP Confirmed!',
        `You're all set for ${item.name}!`,
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.bookingContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.bookingContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>Make a Reservation</Text>
          <TouchableOpacity onPress={() => setShowBooking(false)}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.bookingForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.textMuted}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 7:00 PM"
                placeholderTextColor={C.textMuted}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="people-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor={C.textMuted}
                value={guests}
                onChangeText={setGuests}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Requests</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start' }]}>
              <Ionicons name="document-text-outline" size={20} color={C.textMuted} style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requests or dietary requirements..."
                placeholderTextColor={C.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleBook} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={G.gold} style={styles.confirmBtn}>
              {loading ? (
                <ActivityIndicator color={C.bg} />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
                  <Ionicons name="checkmark" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const getActionButton = () => {
    if (type === 'event') {
      return (
        <TouchableOpacity onPress={handleRSVP} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={G.gold} style={styles.actionBtn}>
            {loading ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={18} color={C.bg} style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnText}>RSVP Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={() => setShowBooking(true)} activeOpacity={0.85}>
        <LinearGradient colors={G.gold} style={styles.actionBtn}>
          <Ionicons name="bookmark-outline" size={18} color={C.bg} style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>
            {type === 'restaurant' ? 'Reserve Table' : type === 'lodging' ? 'Book Now' : 'Book Experience'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: getImageUrl() }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient 
            colors={['rgba(0,0,0,0.4)', 'transparent', G.dark[1]]} 
            style={styles.heroOverlay}
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={[styles.backBtn, { top: insets.top + 16 }]}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          
          {/* Share Button */}
          <TouchableOpacity 
            style={[styles.shareBtn, { top: insets.top + 16 }]}
            onPress={() => Alert.alert('Share', 'Sharing coming soon!')}
          >
            <Ionicons name="share-outline" size={22} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.cuisine && <Text style={styles.itemType}>{item.cuisine}</Text>}
              {item.category && <Text style={styles.itemType}>{item.category}</Text>}
              {item.type && !item.cuisine && <Text style={styles.itemType}>{item.type}</Text>}
            </View>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color={C.gold} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            {item.priceRange && (
              <View style={styles.infoItem}>
                <Ionicons name="cash-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.priceRange}</Text>
              </View>
            )}
            {item.price && (
              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>${item.price}{item.priceUnit ? `/${item.priceUnit}` : ''}</Text>
              </View>
            )}
            {item.duration && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.duration}</Text>
              </View>
            )}
            {item.hours && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.hours}</Text>
              </View>
            )}
            {item.venue && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.venue}</Text>
              </View>
            )}
            {item.capacity && (
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.capacity} guests</Text>
              </View>
            )}
            {item.dressCode && (
              <View style={styles.infoItem}>
                <Ionicons name="shirt-outline" size={18} color={C.gold} />
                <Text style={styles.infoText}>{item.dressCode}</Text>
              </View>
            )}
          </View>

          {/* Event Date */}
          {type === 'event' && item.date && (
            <View style={styles.eventDateCard}>
              <View style={styles.dateIconWrap}>
                <Ionicons name="calendar" size={24} color={C.gold} />
              </View>
              <View>
                <Text style={styles.eventDate}>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {item.description || item.shortDescription || 'No description available.'}
            </Text>
          </View>

          {/* Features/Amenities */}
          {(item.features || item.amenities || item.includes) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {item.includes ? "What's Included" : 'Features'}
              </Text>
              <View style={styles.featuresList}>
                {(item.features || item.amenities || item.includes || []).map((feature: string, i: number) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={C.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsWrap}>
            {item.dogFriendly && (
              <View style={styles.tag}>
                <Ionicons name="paw" size={14} color={C.gold} />
                <Text style={styles.tagText}>Dog Friendly</Text>
              </View>
            )}
            {item.kidsFriendly && (
              <View style={styles.tag}>
                <Ionicons name="happy" size={14} color={C.gold} />
                <Text style={styles.tagText}>Kids Friendly</Text>
              </View>
            )}
            {item.reservationRequired && (
              <View style={styles.tag}>
                <Ionicons name="calendar" size={14} color={C.gold} />
                <Text style={styles.tagText}>Reservation Required</Text>
              </View>
            )}
            {item.isFeatured && (
              <View style={styles.tag}>
                <Ionicons name="star" size={14} color={C.gold} />
                <Text style={styles.tagText}>Featured</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {getActionButton()}
      </View>

      {/* Booking Modal */}
      {showBooking && (
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          {renderBookingForm()}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: -30,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 100,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
    color: C.gold,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.gold,
    marginLeft: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: C.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  eventDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.goldMuted,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  dateIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventDate: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  eventTime: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: C.textSec,
    lineHeight: 24,
  },
  featuresList: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: C.text,
    marginLeft: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: C.gold,
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  // Booking Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  bookingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bookingContent: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  bookingForm: {},
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: C.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
});
