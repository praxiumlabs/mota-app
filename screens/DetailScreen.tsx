/**
 * Detail Screen
 * View details and book restaurants, events, activities, lodging
 * With ImageGrid for multiple images display
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Image, ScrollView,
  KeyboardAvoidingView, Platform, TextInput, Alert, ActivityIndicator,
  Dimensions, FlatList, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from '../constants/theme';
import api from '../services/api';
import { CalendarGrid } from '../components/BookingComponents';
import ImageGrid from '../components/ImageGrid';

const { width } = Dimensions.get('window');

interface Props {
  item: any;
  type: 'restaurant' | 'event' | 'activity' | 'lodging' | 'nightlife';
  onBack: () => void;
}

// Time slot options
const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
  '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
];

// Guest count options
const GUEST_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

// Occasion options
const OCCASIONS = ['None', 'Birthday', 'Anniversary', 'Date Night', 'Business Meal', 'Celebration', 'Other'];

export default function DetailScreen({ item, type, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Booking form state
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [occasion, setOccasion] = useState('None');
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Get all images - format for ImageGrid
  const getImages = () => {
    if (item.images && item.images.length > 0) {
      return item.images.map((img: any) => ({
        url: typeof img === 'string' ? img : img.url,
        caption: img.caption || '',
        isPrimary: img.isPrimary || false
      }));
    }
    return [{ url: item.image || PLACEHOLDER_IMAGE, caption: '', isPrimary: true }];
  };

  const images = getImages();

  const handleBook = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a reservation.');
      return;
    }

    if (!date) {
      Alert.alert('Date Required', 'Please select a date for your reservation.');
      return;
    }

    if (type !== 'event' && !selectedTime) {
      Alert.alert('Time Required', 'Please select a time for your reservation.');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        itemType: type,
        itemId: item._id,
        itemName: item.name,
        date: date,
        time: type === 'event' ? item.time : selectedTime,
        guestCount: parseInt(guests) || 1,
        occasion: occasion !== 'None' ? occasion : null,
        bookingDetails: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          specialRequests: `${specialRequests}${dietaryRequirements ? '\nDietary: ' + dietaryRequirements : ''}`
        },
        isFixedEvent: type === 'event'
      };

      const response = await api.post('/reservations', bookingData);
      
      Alert.alert(
        'Reservation Confirmed! 🎉',
        `Your ${type} reservation has been confirmed.\n\nConfirmation #: ${response.data.confirmationNumber || 'Pending'}`,
        [{ text: 'Done', onPress: () => setShowBooking(false) }]
      );
      
      // Reset form
      setDate('');
      setSelectedTime('');
      setSpecialRequests('');
      setDietaryRequirements('');
    } catch (error: any) {
      Alert.alert('Booking Failed', error.response?.data?.error || 'Unable to complete your reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render restaurant-specific info
  const renderRestaurantInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.quickInfoRow}>
        {item.priceRange && (
          <View style={styles.quickInfoItem}>
            <Text style={styles.priceRange}>{item.priceRange}</Text>
          </View>
        )}
        {item.cuisine && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="restaurant-outline" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>{item.cuisine}</Text>
          </View>
        )}
        {item.rating && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="star" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>{item.rating}</Text>
          </View>
        )}
      </View>

      {item.dressCode && (
        <View style={styles.detailRow}>
          <Ionicons name="shirt-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>Dress Code:</Text>
          <Text style={styles.detailValue}>{item.dressCode}</Text>
        </View>
      )}

      {item.hours && (
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>Hours:</Text>
          <Text style={styles.detailValue}>{item.hours}</Text>
        </View>
      )}

      {item.features && item.features.length > 0 && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featuresList}>
            {item.features.map((feature: string, i: number) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={C.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // Render lodging-specific info
  const renderLodgingInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.quickInfoRow}>
        {item.price && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="cash-outline" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>${item.price}/{item.priceUnit || 'night'}</Text>
          </View>
        )}
        {item.type && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="home-outline" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>{item.type}</Text>
          </View>
        )}
        {item.rating && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="star" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>{item.rating}</Text>
          </View>
        )}
      </View>

      {/* Room Details */}
      <View style={styles.roomDetailsRow}>
        {item.bedrooms && (
          <View style={styles.roomDetail}>
            <Ionicons name="bed-outline" size={20} color={C.textSec} />
            <Text style={styles.roomDetailText}>{item.bedrooms} Bedroom{item.bedrooms > 1 ? 's' : ''}</Text>
          </View>
        )}
        {item.bathrooms && (
          <View style={styles.roomDetail}>
            <Ionicons name="water-outline" size={20} color={C.textSec} />
            <Text style={styles.roomDetailText}>{item.bathrooms} Bath{item.bathrooms > 1 ? 's' : ''}</Text>
          </View>
        )}
        {item.maxGuests && (
          <View style={styles.roomDetail}>
            <Ionicons name="people-outline" size={20} color={C.textSec} />
            <Text style={styles.roomDetailText}>Max {item.maxGuests} Guests</Text>
          </View>
        )}
        {item.squareFeet && (
          <View style={styles.roomDetail}>
            <Ionicons name="resize-outline" size={20} color={C.textSec} />
            <Text style={styles.roomDetailText}>{item.squareFeet} sq ft</Text>
          </View>
        )}
      </View>

      {/* View */}
      {item.view && (
        <View style={styles.detailRow}>
          <Ionicons name="eye-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>View:</Text>
          <Text style={styles.detailValue}>{item.view.charAt(0).toUpperCase() + item.view.slice(1)}</Text>
        </View>
      )}

      {/* Amenities */}
      {item.amenities && item.amenities.length > 0 && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.featuresList}>
            {item.amenities.map((amenity: string, i: number) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={C.success} />
                <Text style={styles.featureText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // Render event-specific info
  const renderEventInfo = () => (
    <View style={styles.infoSection}>
      <View style={styles.eventDateBox}>
        <View style={styles.eventDateDay}>
          <Text style={styles.eventDayNumber}>{new Date(item.date).getDate()}</Text>
          <Text style={styles.eventMonth}>{new Date(item.date).toLocaleString('en', { month: 'short' })}</Text>
        </View>
        <View style={styles.eventDateDetails}>
          <Text style={styles.eventTime}>{item.time || 'Time TBD'}</Text>
          <Text style={styles.eventVenue}>{item.venue}</Text>
          {item.venueAddress && <Text style={styles.eventAddress}>{item.venueAddress}</Text>}
        </View>
      </View>

      {item.category && (
        <View style={[styles.categoryBadge, { backgroundColor: C.gold + '20' }]}>
          <Text style={[styles.categoryBadgeText, { color: C.gold }]}>{item.category}</Text>
        </View>
      )}

      {item.price ? (
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceAmount}>${item.price}</Text>
          <Text style={styles.priceNote}>per person</Text>
        </View>
      ) : (
        <View style={[styles.priceBox, { backgroundColor: C.success + '20' }]}>
          <Text style={[styles.priceAmount, { color: C.success }]}>Complimentary</Text>
        </View>
      )}

      {item.capacity && (
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>Capacity:</Text>
          <Text style={styles.detailValue}>{item.capacity} guests</Text>
        </View>
      )}
    </View>
  );

  // Action button based on type and auth state
  const getActionButton = () => {
    if (!user) {
      return (
        <TouchableOpacity onPress={() => Alert.alert('Sign In Required', 'Please sign in to make a reservation.')} activeOpacity={0.85}>
          <LinearGradient colors={G.gold} style={styles.actionBtn}>
            <Ionicons name="person-outline" size={18} color={C.bg} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Sign In to Reserve</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (type === 'event') {
      return (
        <TouchableOpacity onPress={() => setShowBooking(true)} activeOpacity={0.85}>
          <LinearGradient colors={G.gold} style={styles.actionBtn}>
            <Ionicons name="calendar-outline" size={18} color={C.bg} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>RSVP Now</Text>
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

  // Render booking modal
  const renderBookingModal = () => (
    <Modal visible={showBooking} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <LinearGradient colors={G.card} style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {type === 'event' ? 'RSVP' : type === 'restaurant' ? 'Reserve Table' : 'Book Now'}
              </Text>
              <TouchableOpacity onPress={() => setShowBooking(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Item Summary */}
              <View style={styles.bookingSummary}>
                <Image source={{ uri: images[0]?.url || PLACEHOLDER_IMAGE }} style={styles.bookingImage} />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingName}>{item.name}</Text>
                  <Text style={styles.bookingType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </View>
              </View>

              {/* Date Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Select Date</Text>
                <CalendarGrid 
                  selectedDate={date} 
                  onSelectDate={setDate}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              </View>

              {/* Time Selection (not for events) */}
              {type !== 'event' && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Select Time</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.timeSlots}>
                      {TIME_SLOTS.map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                          onPress={() => setSelectedTime(time)}
                        >
                          <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Guest Count */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Number of Guests</Text>
                <View style={styles.guestOptions}>
                  {GUEST_OPTIONS.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[styles.guestOption, guests === num && styles.guestOptionActive]}
                      onPress={() => setGuests(num)}
                    >
                      <Text style={[styles.guestOptionText, guests === num && styles.guestOptionTextActive]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Occasion (for restaurants) */}
              {type === 'restaurant' && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Occasion (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.occasionOptions}>
                      {OCCASIONS.map((occ) => (
                        <TouchableOpacity
                          key={occ}
                          style={[styles.occasionOption, occasion === occ && styles.occasionOptionActive]}
                          onPress={() => setOccasion(occ)}
                        >
                          <Text style={[styles.occasionOptionText, occasion === occ && styles.occasionOptionTextActive]}>
                            {occ}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Contact Info */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Contact Information</Text>
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                    placeholder="First Name"
                    placeholderTextColor={C.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    placeholder="Last Name"
                    placeholderTextColor={C.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
                <TextInput
                  style={styles.formInput}
                  placeholder="Email"
                  placeholderTextColor={C.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Phone"
                  placeholderTextColor={C.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Special Requests */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Special Requests (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Any special requests..."
                  placeholderTextColor={C.textMuted}
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Dietary Requirements (for restaurants) */}
              {type === 'restaurant' && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Dietary Requirements (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
                    placeholderTextColor={C.textMuted}
                    value={dietaryRequirements}
                    onChangeText={setDietaryRequirements}
                  />
                </View>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Book Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={handleBook} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={G.gold} style={styles.bookBtn}>
                  {loading ? (
                    <ActivityIndicator color={C.bg} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={C.bg} style={{ marginRight: 8 }} />
                      <Text style={styles.bookBtnText}>Confirm Reservation</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Grid - Multi-image support */}
        <View style={styles.imageGridContainer}>
          <ImageGrid 
            images={images}
            height={300}
            borderRadius={0}
          />
          
          {/* Back Button Overlay */}
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 16 }]} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          
          {/* Image Count Badge */}
          {images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Ionicons name="images-outline" size={14} color="#fff" />
              <Text style={styles.imageCountText}>{images.length}</Text>
            </View>
          )}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>
          
          {/* Type-specific info */}
          {type === 'restaurant' && renderRestaurantInfo()}
          {type === 'lodging' && renderLodgingInfo()}
          {type === 'event' && renderEventInfo()}
          {(type === 'activity' || type === 'nightlife') && renderRestaurantInfo()}
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Location */}
          {item.location && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={20} color={C.gold} />
                <Text style={styles.locationText}>
                  {item.location.building}{item.location.floor ? `, Floor ${item.location.floor}` : ''}
                </Text>
              </View>
            </View>
          )}

          {/* Contact */}
          {(item.phone || item.email) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {item.phone && (
                <TouchableOpacity style={styles.contactRow}>
                  <Ionicons name="call-outline" size={18} color={C.gold} />
                  <Text style={styles.contactText}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              {item.email && (
                <TouchableOpacity style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={18} color={C.gold} />
                  <Text style={styles.contactText}>{item.email}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        {getActionButton()}
      </View>

      {/* Booking Modal */}
      {renderBookingModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Image Grid
  imageGridContainer: { position: 'relative' },
  imageCountBadge: { 
    position: 'absolute', 
    bottom: 16, 
    right: 16, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  imageCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  
  // Navigation
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  
  // Content
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 16 },
  
  // Info Section
  infoSection: { marginBottom: 24 },
  quickInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  quickInfoText: { color: C.text, fontSize: 14, fontWeight: '500' },
  priceRange: { color: C.gold, fontSize: 16, fontWeight: '700' },
  
  // Detail Rows
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  detailLabel: { color: C.textMuted, fontSize: 14 },
  detailValue: { color: C.text, fontSize: 14, fontWeight: '500' },
  
  // Room Details
  roomDetailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border },
  roomDetail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomDetailText: { color: C.textSec, fontSize: 14 },
  
  // Features
  featuresSection: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  featuresList: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: C.textSec, fontSize: 14 },
  
  // Event
  eventDateBox: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  eventDateDay: { alignItems: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: C.border },
  eventDayNumber: { fontSize: 32, fontWeight: '800', color: C.gold },
  eventMonth: { fontSize: 14, color: C.textSec, textTransform: 'uppercase' },
  eventDateDetails: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  eventTime: { fontSize: 18, fontWeight: '700', color: C.text },
  eventVenue: { fontSize: 14, color: C.textSec, marginTop: 4 },
  eventAddress: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  priceBox: { backgroundColor: C.card, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  priceLabel: { fontSize: 12, color: C.textMuted },
  priceAmount: { fontSize: 28, fontWeight: '800', color: C.gold, marginVertical: 4 },
  priceNote: { fontSize: 12, color: C.textMuted },
  
  // Description
  descriptionSection: { marginBottom: 24 },
  description: { color: C.textSec, fontSize: 15, lineHeight: 24 },
  
  // Location
  locationSection: { marginBottom: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { color: C.textSec, fontSize: 14, flex: 1 },
  
  // Contact
  contactSection: { marginBottom: 24 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  contactText: { color: C.gold, fontSize: 14 },
  
  // Action Bar
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 20, paddingTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  actionBtnText: { color: C.bg, fontSize: 16, fontWeight: '700' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  modalClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20 },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: C.border },
  
  // Booking Summary
  bookingSummary: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 12, marginBottom: 24 },
  bookingImage: { width: 60, height: 60, borderRadius: 8 },
  bookingInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  bookingName: { fontSize: 16, fontWeight: '600', color: C.text },
  bookingType: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  
  // Form
  formSection: { marginBottom: 24 },
  formLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 12 },
  formInput: { backgroundColor: C.bg, borderRadius: 12, padding: 14, fontSize: 15, color: C.text, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  formRow: { flexDirection: 'row' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
  // Time Slots
  timeSlots: { flexDirection: 'row', gap: 8 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bg, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  timeSlotActive: { backgroundColor: C.gold, borderColor: C.gold },
  timeSlotText: { fontSize: 14, color: C.textSec },
  timeSlotTextActive: { color: C.bg, fontWeight: '600' },
  
  // Guest Options
  guestOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  guestOption: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, borderRadius: 22, borderWidth: 1, borderColor: C.border },
  guestOptionActive: { backgroundColor: C.gold, borderColor: C.gold },
  guestOptionText: { fontSize: 15, color: C.textSec },
  guestOptionTextActive: { color: C.bg, fontWeight: '600' },
  
  // Occasion Options
  occasionOptions: { flexDirection: 'row', gap: 8 },
  occasionOption: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bg, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  occasionOptionActive: { backgroundColor: C.gold, borderColor: C.gold },
  occasionOptionText: { fontSize: 14, color: C.textSec },
  occasionOptionTextActive: { color: C.bg, fontWeight: '600' },
  
  // Book Button
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  bookBtnText: { color: C.bg, fontSize: 16, fontWeight: '700' },
});
