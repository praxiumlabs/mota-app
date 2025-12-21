/**
 * Detail Screen
 * View details and book restaurants, events, activities, lodging
 * With ImageGrid for multiple images display
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Image, ScrollView,
  Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from '../constants/theme';
import ImageGrid from '../components/ImageGrid';

const { width } = Dimensions.get('window');

interface Props {
  item: any;
  type: 'restaurant' | 'event' | 'activity' | 'lodging' | 'nightlife';
  onBack: () => void;
  onBook: (item: any, type: string, isFixed: boolean) => void;
}

export default function DetailScreen({ item, type, onBack, onBook }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

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
        <TouchableOpacity onPress={() => onBook(item, type, true)} activeOpacity={0.85}>
          <LinearGradient colors={G.gold} style={styles.actionBtn}>
            <Ionicons name="calendar-outline" size={18} color={C.bg} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>RSVP Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={() => onBook(item, type, false)} activeOpacity={0.85}>
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
});
