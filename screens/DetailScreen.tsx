/**
 * Detail Screen
 * View details and book restaurants, events, activities, lodging
 * With comprehensive information and proper reservation flow
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageListRef = useRef<FlatList>(null);
  
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

  // Get all images
  const getImages = () => {
    if (item.images && item.images.length > 0) {
      return item.images.map((img: any) => img.url || img);
    }
    return [item.image || PLACEHOLDER_IMAGE];
  };

  const images = getImages();

  const handleBook = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a reservation.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: onBack }
      ]);
      return;
    }

    if (!date) {
      Alert.alert('Required', 'Please select a date for your reservation');
      return;
    }

    if (!selectedTime && type !== 'lodging') {
      Alert.alert('Required', 'Please select a time for your reservation');
      return;
    }

    if (!firstName || !lastName) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    if (!email) {
      Alert.alert('Required', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        type,
        itemId: item._id || item.id,
        itemName: item.name,
        date,
        time: selectedTime || 'TBD',
        guests: parseInt(guests) || 2,
        specialRequests,
        dietaryRequirements,
        occasion: occasion !== 'None' ? occasion : undefined,
        contactInfo: {
          firstName,
          lastName,
          email,
          phone
        }
      };

      const response = await api.post('/reservations', reservationData);
      
      Alert.alert(
        '✓ Reservation Confirmed!',
        `Your reservation at ${item.name} has been confirmed.\n\nConfirmation #: ${response.data?.reservation?.confirmationNumber || 'PENDING'}\n\nDate: ${date}\nTime: ${selectedTime || 'TBD'}\nGuests: ${guests}`,
        [{ text: 'Done', onPress: onBack }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to make reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to RSVP.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: onBack }
      ]);
      return;
    }

    setLoading(true);
    try {
      await api.rsvpEvent(item._id, {
        guests: parseInt(guests) || 1,
        dietaryRequirements,
        specialRequests
      });
      
      Alert.alert(
        '✓ RSVP Confirmed!',
        `You're all set for ${item.name}!\n\nDate: ${new Date(item.date).toLocaleDateString()}\nTime: ${item.time || 'TBD'}\nGuests: ${guests}`,
        [{ text: 'Done', onPress: onBack }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  // Render image gallery
  const renderImageGallery = () => (
    <View style={styles.galleryContainer}>
      <FlatList
        ref={imageListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(index);
        }}
        keyExtractor={(_, i) => `img-${i}`}
        renderItem={({ item: imageUrl }) => (
          <Image source={{ uri: imageUrl }} style={styles.galleryImage} resizeMode="cover" />
        )}
      />
      {images.length > 1 && (
        <View style={styles.imageIndicators}>
          {images.map((_: any, i: number) => (
            <View key={i} style={[styles.imageIndicator, currentImageIndex === i && styles.imageIndicatorActive]} />
          ))}
        </View>
      )}
      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', G.dark[1]]} style={styles.galleryOverlay} />
    </View>
  );

  // Render restaurant-specific info
  const renderRestaurantInfo = () => (
    <View style={styles.infoSection}>
      {/* Quick Info Row */}
      <View style={styles.quickInfoRow}>
        {item.priceRange && (
          <View style={styles.quickInfoItem}>
            <Ionicons name="cash-outline" size={16} color={C.gold} />
            <Text style={styles.quickInfoText}>{item.priceRange}</Text>
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
            <Text style={styles.quickInfoText}>{item.rating} ({item.reviewCount || 0})</Text>
          </View>
        )}
      </View>

      {/* Features */}
      {(item.dogFriendly || item.kidsFriendly) && (
        <View style={styles.featuresRow}>
          {item.kidsFriendly && (
            <View style={styles.featureBadge}>
              <Ionicons name="people" size={14} color={C.gold} />
              <Text style={styles.featureBadgeText}>Kids Friendly</Text>
            </View>
          )}
          {item.dogFriendly && (
            <View style={styles.featureBadge}>
              <Ionicons name="paw" size={14} color={C.gold} />
              <Text style={styles.featureBadgeText}>Dog Friendly</Text>
            </View>
          )}
          {item.reservationRequired && (
            <View style={styles.featureBadge}>
              <Ionicons name="calendar" size={14} color={C.gold} />
              <Text style={styles.featureBadgeText}>Reservation Required</Text>
            </View>
          )}
        </View>
      )}

      {/* Dress Code */}
      {item.dressCode && (
        <View style={styles.detailRow}>
          <Ionicons name="shirt-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>Dress Code:</Text>
          <Text style={styles.detailValue}>{item.dressCode}</Text>
        </View>
      )}

      {/* Hours */}
      {item.hours && (
        <View style={styles.hoursSection}>
          <Text style={styles.sectionTitle}>Hours</Text>
          {Object.entries(item.hours).map(([day, hours]: [string, any]) => (
            hours && hours.open && (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hoursText}>{hours.open} - {hours.close}</Text>
              </View>
            )
          ))}
        </View>
      )}

      {/* Menu Highlights */}
      {item.menuHighlights && item.menuHighlights.length > 0 && (
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Highlights</Text>
          {item.menuHighlights.map((menuItem: any, i: number) => (
            <View key={i} style={styles.menuItem}>
              <View style={styles.menuItemHeader}>
                <Text style={styles.menuItemName}>{menuItem.name}</Text>
                {menuItem.price && <Text style={styles.menuItemPrice}>${menuItem.price}</Text>}
              </View>
              {menuItem.description && <Text style={styles.menuItemDesc}>{menuItem.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Features List */}
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
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Admission</Text>
          <Text style={styles.priceValue}>${item.price}</Text>
        </View>
      ) : (
        <View style={styles.freeBadge}>
          <Ionicons name="gift-outline" size={16} color={C.success} />
          <Text style={styles.freeText}>Free Event</Text>
        </View>
      )}

      {item.capacity && (
        <View style={styles.capacityRow}>
          <Ionicons name="people-outline" size={18} color={C.textMuted} />
          <Text style={styles.capacityText}>
            {item.currentRSVPs || 0} / {item.capacity} spots filled
          </Text>
        </View>
      )}

      {item.dressCode && (
        <View style={styles.detailRow}>
          <Ionicons name="shirt-outline" size={18} color={C.textMuted} />
          <Text style={styles.detailLabel}>Dress Code:</Text>
          <Text style={styles.detailValue}>{item.dressCode}</Text>
        </View>
      )}
    </View>
  );

  // Render reservation modal
  const renderBookingModal = () => (
    <Modal visible={showBooking} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Fixed Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Make a Reservation</Text>
            <TouchableOpacity onPress={() => setShowBooking(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Venue Info */}
              <View style={styles.reservationVenue}>
                <Image source={{ uri: images[0] }} style={styles.reservationVenueImage} />
                <View style={styles.reservationVenueInfo}>
                  <Text style={styles.reservationVenueName}>{item.name}</Text>
                  <Text style={styles.reservationVenueType}>{item.cuisine || item.type || type}</Text>
                </View>
              </View>

              {/* Date Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Select date (YYYY-MM-DD)"
                    placeholderTextColor={C.textMuted}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              {/* Time Selection */}
              {type !== 'lodging' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Time *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlots}>
                    {TIME_SLOTS.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]}
                        onPress={() => setSelectedTime(slot)}
                      >
                        <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Guest Count */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Guests</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guestOptions}>
                  {GUEST_OPTIONS.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[styles.guestOption, guests === num && styles.guestOptionActive]}
                      onPress={() => setGuests(num)}
                    >
                      <Text style={[styles.guestOptionText, guests === num && styles.guestOptionTextActive]}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Occasion */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Occasion (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.occasionOptions}>
                  {OCCASIONS.map((occ) => (
                    <TouchableOpacity
                      key={occ}
                      style={[styles.occasionOption, occasion === occ && styles.occasionOptionActive]}
                      onPress={() => setOccasion(occ)}
                    >
                      <Text style={[styles.occasionOptionText, occasion === occ && styles.occasionOptionTextActive]}>{occ}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Contact Info */}
              <Text style={styles.sectionHeader}>Contact Information</Text>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>First Name *</Text>
                  <TextInput
                    style={styles.inputSimple}
                    placeholder="First name"
                    placeholderTextColor={C.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.inputSimple}
                    placeholder="Last name"
                    placeholderTextColor={C.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.inputSimple}
                  placeholder="your@email.com"
                  placeholderTextColor={C.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.inputSimple}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={C.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Special Requests */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Special Requests</Text>
                <TextInput
                  style={[styles.inputSimple, styles.textArea]}
                  placeholder="Any special requests..."
                  placeholderTextColor={C.textMuted}
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dietary Requirements</Text>
                <TextInput
                  style={styles.inputSimple}
                  placeholder="Allergies, dietary restrictions..."
                  placeholderTextColor={C.textMuted}
                  value={dietaryRequirements}
                  onChangeText={setDietaryRequirements}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Fixed Confirm Button at Bottom */}
          <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity onPress={handleBook} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={G.gold} style={styles.confirmBtn}>
                {loading ? (
                  <ActivityIndicator color={C.bg} />
                ) : (
                  <>
                    <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
                    <Ionicons name="checkmark-circle" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}
        
        {/* Back Button */}
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + 16 }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        
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
  
  // Gallery
  galleryContainer: { height: 300, position: 'relative' },
  galleryImage: { width, height: 300 },
  galleryOverlay: { ...StyleSheet.absoluteFillObject },
  imageIndicators: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', gap: 8 },
  imageIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  imageIndicatorActive: { backgroundColor: C.gold, width: 20 },
  
  // Navigation
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  
  // Content
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  
  // Info Section
  infoSection: { marginBottom: 24 },
  quickInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickInfoText: { fontSize: 14, color: C.textSec, fontWeight: '500' },
  
  // Features
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  featureBadgeText: { fontSize: 12, color: C.textSec },
  
  // Detail Rows
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  detailLabel: { fontSize: 14, color: C.textMuted },
  detailValue: { fontSize: 14, color: C.text, fontWeight: '500' },
  
  // Hours
  hoursSection: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  dayText: { fontSize: 14, color: C.textSec },
  hoursText: { fontSize: 14, color: C.text },
  
  // Menu
  menuSection: { marginTop: 20 },
  menuItem: { backgroundColor: C.card, padding: 16, borderRadius: 12, marginBottom: 12 },
  menuItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  menuItemName: { fontSize: 15, fontWeight: '600', color: C.text },
  menuItemPrice: { fontSize: 14, fontWeight: '600', color: C.gold },
  menuItemDesc: { fontSize: 13, color: C.textSec },
  
  // Features List
  featuresSection: { marginTop: 20 },
  featuresList: { gap: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: C.textSec },
  
  // Room Details
  roomDetailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.cardLight },
  roomDetail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomDetailText: { fontSize: 14, color: C.textSec },
  
  // Event
  eventDateBox: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  eventDateDay: { alignItems: 'center', justifyContent: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: C.cardLight },
  eventDayNumber: { fontSize: 32, fontWeight: '800', color: C.gold },
  eventMonth: { fontSize: 14, color: C.textSec, textTransform: 'uppercase' },
  eventDateDetails: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  eventTime: { fontSize: 16, fontWeight: '600', color: C.text },
  eventVenue: { fontSize: 14, color: C.textSec, marginTop: 4 },
  eventAddress: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  priceLabel: { fontSize: 14, color: C.textSec },
  priceValue: { fontSize: 20, fontWeight: '700', color: C.gold },
  freeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  freeText: { fontSize: 14, fontWeight: '600', color: C.success },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capacityText: { fontSize: 14, color: C.textSec },
  
  // Description
  descriptionSection: { marginBottom: 24 },
  description: { fontSize: 15, color: C.textSec, lineHeight: 24 },
  
  // Location
  locationSection: { marginBottom: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { fontSize: 15, color: C.textSec },
  
  // Contact
  contactSection: { marginBottom: 24 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  contactText: { fontSize: 15, color: C.text },
  
  // Action Bar
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 16, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.cardLight, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: C.bg },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', minHeight: '70%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1, padding: 20 },
  modalFooter: { padding: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.cardLight, backgroundColor: C.bg },
  
  // Reservation Venue
  reservationVenue: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 24 },
  reservationVenueImage: { width: 60, height: 60, borderRadius: 8 },
  reservationVenueInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  reservationVenueName: { fontSize: 16, fontWeight: '600', color: C.text },
  reservationVenueType: { fontSize: 13, color: C.textSec, marginTop: 2 },
  
  // Form
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted, marginBottom: 8 },
  formRow: { flexDirection: 'row' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 12, marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.text },
  inputSimple: { backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: C.text },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  // Time Slots
  timeSlots: { marginTop: 8 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.card, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: C.cardLight },
  timeSlotActive: { backgroundColor: C.gold, borderColor: C.gold },
  timeSlotText: { fontSize: 13, color: C.textSec, fontWeight: '500' },
  timeSlotTextActive: { color: C.bg },
  
  // Guest Options
  guestOptions: { marginTop: 8 },
  guestOption: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: C.cardLight },
  guestOptionActive: { backgroundColor: C.gold, borderColor: C.gold },
  guestOptionText: { fontSize: 14, color: C.textSec, fontWeight: '600' },
  guestOptionTextActive: { color: C.bg },
  
  // Occasion Options
  occasionOptions: { marginTop: 8 },
  occasionOption: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.card, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: C.cardLight },
  occasionOptionActive: { backgroundColor: C.gold, borderColor: C.gold },
  occasionOptionText: { fontSize: 13, color: C.textSec, fontWeight: '500' },
  occasionOptionTextActive: { color: C.bg },
  
  // Confirm Button
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: C.bg },
});
