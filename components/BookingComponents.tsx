/**
 * =====================================================
 * MOTA BOOKING SYSTEM - COMPLETE IMPLEMENTATION
 * =====================================================
 * 
 * Features:
 * - Calendar Grid UI for date selection
 * - Time slot selection from backend
 * - Booking details (name, email, phone, special requests)
 * - Dietary restrictions flow
 * - Fixed events (read-only date/time)
 * - Consistent UI across all booking types
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Theme colors
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


// =====================================================
// CALENDAR GRID COMPONENT
// =====================================================
export const CalendarGrid = ({ 
  selectedDate, 
  onSelectDate, 
  availableDates = [],
  minDate = new Date(),
  maxDate = null,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ day: i, date });
    }
    
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) return false;
    
    // Check if date is before minDate
    if (minDate && date < minDate) return false;
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) return false;
    
    // If availableDates is provided and not empty, check if date is in the list
    if (availableDates.length > 0) {
      return availableDates.some(d => 
        new Date(d).toDateString() === date.toDateString()
      );
    }
    
    return true;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === new Date(selectedDate).toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={calendarStyles.container}>
      {/* Month Navigation */}
      <View style={calendarStyles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={calendarStyles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={C.gold} />
        </TouchableOpacity>
        <Text style={calendarStyles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={calendarStyles.navBtn}>
          <Ionicons name="chevron-forward" size={24} color={C.gold} />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={calendarStyles.weekHeader}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={calendarStyles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={calendarStyles.grid}>
        {days.map((item, index) => {
          const available = isDateAvailable(item.date);
          const selected = isDateSelected(item.date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                calendarStyles.dayCell,
                !item.day && calendarStyles.emptyCell,
                !available && item.day && calendarStyles.unavailableCell,
                selected && calendarStyles.selectedCell,
              ]}
              onPress={() => item.day && available && onSelectDate(item.date)}
              disabled={!item.day || !available}
            >
              {item.day && (
                <Text style={[
                  calendarStyles.dayText,
                  !available && calendarStyles.unavailableText,
                  selected && calendarStyles.selectedText,
                ]}>
                  {item.day}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const calendarStyles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  unavailableCell: {
    opacity: 0.3,
  },
  selectedCell: {
    backgroundColor: C.gold,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  unavailableText: {
    color: C.textMuted,
    textDecorationLine: 'line-through',
  },
  selectedText: {
    color: C.bg,
    fontWeight: '700',
  },
});


// =====================================================
// TIME SLOT SELECTOR COMPONENT
// =====================================================
export const TimeSlotSelector = ({ 
  selectedTime, 
  onSelectTime, 
  availableSlots = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={timeStyles.loadingContainer}>
        <ActivityIndicator size="small" color={C.gold} />
        <Text style={timeStyles.loadingText}>Loading available times...</Text>
      </View>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <View style={timeStyles.emptyContainer}>
        <Ionicons name="time-outline" size={32} color={C.textMuted} />
        <Text style={timeStyles.emptyText}>No time slots available for this date</Text>
      </View>
    );
  }

  return (
    <View style={timeStyles.container}>
      <Text style={timeStyles.label}>Select Time</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={timeStyles.slotsRow}>
          {availableSlots.map((slot, index) => {
            const isSelected = selectedTime === slot.time;
            const isAvailable = slot.available !== false;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  timeStyles.slot,
                  isSelected && timeStyles.slotSelected,
                  !isAvailable && timeStyles.slotUnavailable,
                ]}
                onPress={() => isAvailable && onSelectTime(slot.time)}
                disabled={!isAvailable}
              >
                <Text style={[
                  timeStyles.slotText,
                  isSelected && timeStyles.slotTextSelected,
                  !isAvailable && timeStyles.slotTextUnavailable,
                ]}>
                  {slot.time}
                </Text>
                {slot.spotsLeft && slot.spotsLeft <= 3 && (
                  <Text style={timeStyles.spotsLeft}>{slot.spotsLeft} left</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const timeStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 12,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  slot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.cardLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardLight,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  slotUnavailable: {
    opacity: 0.4,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  slotTextSelected: {
    color: C.bg,
  },
  slotTextUnavailable: {
    textDecorationLine: 'line-through',
  },
  spotsLeft: {
    fontSize: 10,
    color: C.warning,
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: C.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
  },
});


// =====================================================
// BOOKING DETAILS COMPONENT
// =====================================================
export const BookingDetailsEditor = ({
  bookingDetails,
  onUpdateDetails,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localDetails, setLocalDetails] = useState(bookingDetails);

  useEffect(() => {
    setLocalDetails(bookingDetails);
  }, [bookingDetails]);

  const handleSave = () => {
    onUpdateDetails(localDetails);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <TouchableOpacity 
        style={detailStyles.container} 
        onPress={() => editable && setIsEditing(true)}
        disabled={!editable}
      >
        <View style={detailStyles.header}>
          <View style={detailStyles.headerLeft}>
            <Ionicons name="person-circle-outline" size={24} color={C.gold} />
            <View>
              <Text style={detailStyles.label}>Booked Under</Text>
              <Text style={detailStyles.name}>{bookingDetails.name || 'Add Name'}</Text>
            </View>
          </View>
          {editable && (
            <View style={detailStyles.editBadge}>
              <Ionicons name="pencil" size={14} color={C.gold} />
              <Text style={detailStyles.editText}>Edit</Text>
            </View>
          )}
        </View>
        {bookingDetails.email && (
          <Text style={detailStyles.subInfo}>📧 {bookingDetails.email}</Text>
        )}
        {bookingDetails.phone && (
          <Text style={detailStyles.subInfo}>📱 {bookingDetails.phone}</Text>
        )}
        {bookingDetails.specialRequests && (
          <Text style={detailStyles.subInfo}>📝 {bookingDetails.specialRequests}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={detailStyles.editContainer}>
      <Text style={detailStyles.editTitle}>Booking Details</Text>
      
      <View style={detailStyles.inputGroup}>
        <Text style={detailStyles.inputLabel}>Name *</Text>
        <TextInput
          style={detailStyles.input}
          value={localDetails.name}
          onChangeText={(text) => setLocalDetails({ ...localDetails, name: text })}
          placeholder="Full Name"
          placeholderTextColor={C.textMuted}
        />
      </View>

      <View style={detailStyles.inputGroup}>
        <Text style={detailStyles.inputLabel}>Email *</Text>
        <TextInput
          style={detailStyles.input}
          value={localDetails.email}
          onChangeText={(text) => setLocalDetails({ ...localDetails, email: text })}
          placeholder="email@example.com"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={detailStyles.inputGroup}>
        <Text style={detailStyles.inputLabel}>Phone *</Text>
        <TextInput
          style={detailStyles.input}
          value={localDetails.phone}
          onChangeText={(text) => setLocalDetails({ ...localDetails, phone: text })}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor={C.textMuted}
          keyboardType="phone-pad"
        />
      </View>

      <View style={detailStyles.inputGroup}>
        <Text style={detailStyles.inputLabel}>Special Requests</Text>
        <TextInput
          style={[detailStyles.input, detailStyles.textArea]}
          value={localDetails.specialRequests}
          onChangeText={(text) => setLocalDetails({ ...localDetails, specialRequests: text })}
          placeholder="Any special requests or notes..."
          placeholderTextColor={C.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={detailStyles.buttonRow}>
        <TouchableOpacity 
          style={detailStyles.cancelBtn} 
          onPress={() => {
            setLocalDetails(bookingDetails);
            setIsEditing(false);
          }}
        >
          <Text style={detailStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={detailStyles.saveBtn} onPress={handleSave}>
          <LinearGradient colors={G.gold} style={detailStyles.saveBtnGrad}>
            <Text style={detailStyles.saveText}>Save Details</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const detailStyles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginTop: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontSize: 12,
    color: C.gold,
    fontWeight: '600',
  },
  subInfo: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 8,
    marginLeft: 36,
  },
  editContainer: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.cardLight,
    borderRadius: 10,
    padding: 14,
    color: C.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSec,
  },
  saveBtn: {
    flex: 1,
  },
  saveBtnGrad: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.bg,
  },
});


// =====================================================
// DIETARY RESTRICTIONS FLOW
// =====================================================
export const DietaryRestrictionsModal = ({
  visible,
  onClose,
  currentRestrictions = [],
  onSave,
  onSkip,
}) => {
  const [restrictions, setRestrictions] = useState(currentRestrictions);
  const [customRestriction, setCustomRestriction] = useState('');

  const predefinedOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { id: 'nut-allergy', label: 'Nut Allergy', icon: '🥜' },
    { id: 'shellfish-allergy', label: 'Shellfish Allergy', icon: '🦐' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' },
    { id: 'low-sodium', label: 'Low Sodium', icon: '🧂' },
    { id: 'diabetic', label: 'Diabetic-Friendly', icon: '💉' },
  ];

  const toggleRestriction = (id) => {
    if (restrictions.includes(id)) {
      setRestrictions(restrictions.filter(r => r !== id));
    } else {
      setRestrictions([...restrictions, id]);
    }
  };

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !restrictions.includes(customRestriction.trim())) {
      setRestrictions([...restrictions, customRestriction.trim()]);
      setCustomRestriction('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dietaryStyles.overlay}>
        <View style={dietaryStyles.modal}>
          <View style={dietaryStyles.header}>
            <Ionicons name="restaurant-outline" size={32} color={C.gold} />
            <Text style={dietaryStyles.title}>Dietary Restrictions</Text>
            <Text style={dietaryStyles.subtitle}>
              Do you have any dietary restrictions or allergies we should know about?
            </Text>
          </View>

          <ScrollView style={dietaryStyles.content} showsVerticalScrollIndicator={false}>
            <View style={dietaryStyles.optionsGrid}>
              {predefinedOptions.map((option) => {
                const isSelected = restrictions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      dietaryStyles.optionBtn,
                      isSelected && dietaryStyles.optionBtnSelected,
                    ]}
                    onPress={() => toggleRestriction(option.id)}
                  >
                    <Text style={dietaryStyles.optionIcon}>{option.icon}</Text>
                    <Text style={[
                      dietaryStyles.optionLabel,
                      isSelected && dietaryStyles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={C.gold} style={dietaryStyles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Restriction Input */}
            <View style={dietaryStyles.customSection}>
              <Text style={dietaryStyles.customLabel}>Other (specify):</Text>
              <View style={dietaryStyles.customInputRow}>
                <TextInput
                  style={dietaryStyles.customInput}
                  value={customRestriction}
                  onChangeText={setCustomRestriction}
                  placeholder="Enter custom restriction..."
                  placeholderTextColor={C.textMuted}
                />
                <TouchableOpacity 
                  style={dietaryStyles.addBtn} 
                  onPress={addCustomRestriction}
                  disabled={!customRestriction.trim()}
                >
                  <Ionicons name="add" size={24} color={customRestriction.trim() ? C.gold : C.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Show custom restrictions */}
            {restrictions.filter(r => !predefinedOptions.find(p => p.id === r)).length > 0 && (
              <View style={dietaryStyles.customTags}>
                {restrictions.filter(r => !predefinedOptions.find(p => p.id === r)).map((r, i) => (
                  <View key={i} style={dietaryStyles.customTag}>
                    <Text style={dietaryStyles.customTagText}>{r}</Text>
                    <TouchableOpacity onPress={() => setRestrictions(restrictions.filter(x => x !== r))}>
                      <Ionicons name="close-circle" size={18} color={C.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={dietaryStyles.footer}>
            <TouchableOpacity style={dietaryStyles.skipBtn} onPress={onSkip}>
              <Text style={dietaryStyles.skipText}>No Restrictions</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dietaryStyles.saveBtn} 
              onPress={() => onSave(restrictions)}
            >
              <LinearGradient colors={G.gold} style={dietaryStyles.saveBtnGrad}>
                <Text style={dietaryStyles.saveText}>
                  {restrictions.length > 0 ? `Save (${restrictions.length})` : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const dietaryStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardLight,
    gap: 8,
  },
  optionBtnSelected: {
    borderColor: C.gold,
    backgroundColor: `${C.gold}15`,
  },
  optionIcon: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 13,
    color: C.textSec,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: C.text,
  },
  checkIcon: {
    marginLeft: 4,
  },
  customSection: {
    marginTop: 20,
  },
  customLabel: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 12,
    color: C.text,
    fontSize: 14,
  },
  addBtn: {
    width: 48,
    backgroundColor: C.card,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  customTagText: {
    fontSize: 13,
    color: C.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  skipBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSec,
  },
  saveBtn: {
    flex: 1,
  },
  saveBtnGrad: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.bg,
  },
});


// =====================================================
// GUEST COUNT SELECTOR
// =====================================================
export const GuestCountSelector = ({ count, onChangeCount, maxGuests = 20 }) => {
  return (
    <View style={guestStyles.container}>
      <Text style={guestStyles.label}>Number of Guests</Text>
      <View style={guestStyles.selector}>
        <TouchableOpacity 
          style={guestStyles.btn} 
          onPress={() => onChangeCount(Math.max(1, count - 1))}
          disabled={count <= 1}
        >
          <Ionicons name="remove" size={20} color={count <= 1 ? C.textMuted : C.gold} />
        </TouchableOpacity>
        <View style={guestStyles.countContainer}>
          <Text style={guestStyles.count}>{count}</Text>
          <Text style={guestStyles.countLabel}>guests</Text>
        </View>
        <TouchableOpacity 
          style={guestStyles.btn} 
          onPress={() => onChangeCount(Math.min(maxGuests, count + 1))}
          disabled={count >= maxGuests}
        >
          <Ionicons name="add" size={20} color={count >= maxGuests ? C.textMuted : C.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const guestStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 8,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
  },
  countLabel: {
    fontSize: 12,
    color: C.textMuted,
  },
});


// =====================================================
// OCCASION SELECTOR
// =====================================================
export const OccasionSelector = ({ 
  selectedOccasion, 
  onSelectOccasion,
  disabled = false,
  fixedOccasion = null,
}) => {
  const occasions = [
    { id: 'casual', label: 'Casual Dining', icon: 'restaurant-outline' },
    { id: 'birthday', label: 'Birthday', icon: 'gift-outline' },
    { id: 'anniversary', label: 'Anniversary', icon: 'heart-outline' },
    { id: 'business', label: 'Business', icon: 'briefcase-outline' },
    { id: 'celebration', label: 'Celebration', icon: 'sparkles-outline' },
    { id: 'date', label: 'Date Night', icon: 'moon-outline' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  if (fixedOccasion) {
    return (
      <View style={occasionStyles.fixedContainer}>
        <Text style={occasionStyles.label}>Occasion</Text>
        <View style={occasionStyles.fixedBadge}>
          <Ionicons name="lock-closed" size={14} color={C.gold} />
          <Text style={occasionStyles.fixedText}>{fixedOccasion}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={occasionStyles.container}>
      <Text style={occasionStyles.label}>Occasion (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={occasionStyles.row}>
          {occasions.map((occasion) => {
            const isSelected = selectedOccasion === occasion.id;
            return (
              <TouchableOpacity
                key={occasion.id}
                style={[
                  occasionStyles.option,
                  isSelected && occasionStyles.optionSelected,
                ]}
                onPress={() => onSelectOccasion(isSelected ? null : occasion.id)}
                disabled={disabled}
              >
                <Ionicons 
                  name={occasion.icon as any} 
                  size={20} 
                  color={isSelected ? C.bg : C.textSec} 
                />
                <Text style={[
                  occasionStyles.optionText,
                  isSelected && occasionStyles.optionTextSelected,
                ]}>
                  {occasion.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const occasionStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardLight,
  },
  optionSelected: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSec,
  },
  optionTextSelected: {
    color: C.bg,
  },
  fixedContainer: {
    marginBottom: 16,
  },
  fixedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.cardLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  fixedText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gold,
  },
});


// =====================================================
// FIXED EVENT BOOKING (Read-only date/time)
// =====================================================
export const FixedEventBookingInfo = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={fixedStyles.container}>
      <View style={fixedStyles.header}>
        <Ionicons name="calendar" size={20} color={C.gold} />
        <Text style={fixedStyles.headerText}>Event Schedule</Text>
        <View style={fixedStyles.fixedBadge}>
          <Ionicons name="lock-closed" size={12} color={C.textMuted} />
          <Text style={fixedStyles.fixedBadgeText}>Fixed</Text>
        </View>
      </View>

      <View style={fixedStyles.infoRow}>
        <View style={fixedStyles.infoItem}>
          <Text style={fixedStyles.infoLabel}>Date</Text>
          <Text style={fixedStyles.infoValue}>{formatDate(event.date)}</Text>
        </View>
      </View>

      <View style={fixedStyles.timeRow}>
        {event.gateOpenTime && (
          <View style={fixedStyles.timeItem}>
            <View style={fixedStyles.timeIcon}>
              <Ionicons name="enter-outline" size={18} color={C.gold} />
            </View>
            <View>
              <Text style={fixedStyles.timeLabel}>Gates Open</Text>
              <Text style={fixedStyles.timeValue}>{event.gateOpenTime}</Text>
            </View>
          </View>
        )}
        {event.startTime && (
          <View style={fixedStyles.timeItem}>
            <View style={fixedStyles.timeIcon}>
              <Ionicons name="play-circle-outline" size={18} color={C.gold} />
            </View>
            <View>
              <Text style={fixedStyles.timeLabel}>Event Starts</Text>
              <Text style={fixedStyles.timeValue}>{event.startTime}</Text>
            </View>
          </View>
        )}
        {event.endTime && (
          <View style={fixedStyles.timeItem}>
            <View style={fixedStyles.timeIcon}>
              <Ionicons name="stop-circle-outline" size={18} color={C.textMuted} />
            </View>
            <View>
              <Text style={fixedStyles.timeLabel}>Event Ends</Text>
              <Text style={fixedStyles.timeValue}>{event.endTime}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={fixedStyles.notice}>
        <Ionicons name="information-circle" size={16} color={C.textMuted} />
        <Text style={fixedStyles.noticeText}>
          Date and time cannot be modified for this event
        </Text>
      </View>
    </View>
  );
};

const fixedStyles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    flex: 1,
  },
  fixedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fixedBadgeText: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: '45%',
  },
  timeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  noticeText: {
    fontSize: 12,
    color: C.textMuted,
    flex: 1,
  },
});


// =====================================================
// COMPLETE BOOKING MODAL
// =====================================================
export const BookingModal = ({
  visible,
  onClose,
  item,
  itemType, // 'restaurant' | 'activity' | 'lodging' | 'event'
  user,
  onConfirmBooking,
}) => {
  const [step, setStep] = useState(1); // 1: DateTime, 2: Details, 3: Dietary, 4: Confirm
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [occasion, setOccasion] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
  });
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user?.dietaryRestrictions || []);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFixedEvent = itemType === 'event' && item?.isFixedSchedule;

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && !isFixedEvent) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.getAvailableSlots(item._id, date);
      // setAvailableSlots(response.slots);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setAvailableSlots([
        { time: '11:30 AM', available: true },
        { time: '12:00 PM', available: true, spotsLeft: 2 },
        { time: '12:30 PM', available: true },
        { time: '1:00 PM', available: false },
        { time: '1:30 PM', available: true },
        { time: '6:00 PM', available: true },
        { time: '6:30 PM', available: true, spotsLeft: 1 },
        { time: '7:00 PM', available: true },
        { time: '7:30 PM', available: true },
        { time: '8:00 PM', available: true },
        { time: '8:30 PM', available: true },
        { time: '9:00 PM', available: true },
      ]);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDietarySave = (restrictions) => {
    setDietaryRestrictions(restrictions);
    setStep(4);
  };

  const handleDietarySkip = () => {
    setStep(4);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const bookingData = {
        itemId: item._id,
        itemType,
        date: isFixedEvent ? item.date : selectedDate,
        time: isFixedEvent ? item.startTime : selectedTime,
        guestCount,
        occasion,
        bookingDetails,
        dietaryRestrictions,
        userId: user?._id,
      };

      await onConfirmBooking(bookingData);
      
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your reservation at ${item.name} has been confirmed. You will receive a confirmation email shortly.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'There was an error processing your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToStep2 = isFixedEvent || (selectedDate && selectedTime);
  const canProceedToStep3 = bookingDetails.name && bookingDetails.email && bookingDetails.phone;

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isFixedEvent ? (
        <FixedEventBookingInfo event={item} />
      ) : (
        <>
          <CalendarGrid
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            availableDates={item.availableDates || []}
          />
          
          {selectedDate && (
            <TimeSlotSelector
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              availableSlots={availableSlots}
              loading={loadingSlots}
            />
          )}
        </>
      )}

      <GuestCountSelector
        count={guestCount}
        onChangeCount={setGuestCount}
        maxGuests={item.maxGuests || 20}
      />

      {!isFixedEvent && (
        <OccasionSelector
          selectedOccasion={occasion}
          onSelectOccasion={setOccasion}
        />
      )}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <BookingDetailsEditor
        bookingDetails={bookingDetails}
        onUpdateDetails={setBookingDetails}
        editable={true}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <DietaryRestrictionsModal
      visible={true}
      onClose={() => setStep(2)}
      currentRestrictions={dietaryRestrictions}
      onSave={handleDietarySave}
      onSkip={handleDietarySkip}
    />
  );

  const renderStep4 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={bookingStyles.confirmSection}>
        <Text style={bookingStyles.confirmTitle}>Booking Summary</Text>
        
        <View style={bookingStyles.summaryCard}>
          <View style={bookingStyles.summaryRow}>
            <Text style={bookingStyles.summaryLabel}>Venue</Text>
            <Text style={bookingStyles.summaryValue}>{item.name}</Text>
          </View>
          <View style={bookingStyles.summaryRow}>
            <Text style={bookingStyles.summaryLabel}>Date</Text>
            <Text style={bookingStyles.summaryValue}>
              {isFixedEvent 
                ? new Date(item.date).toLocaleDateString()
                : selectedDate?.toLocaleDateString()
              }
            </Text>
          </View>
          <View style={bookingStyles.summaryRow}>
            <Text style={bookingStyles.summaryLabel}>Time</Text>
            <Text style={bookingStyles.summaryValue}>
              {isFixedEvent ? item.startTime : selectedTime}
            </Text>
          </View>
          <View style={bookingStyles.summaryRow}>
            <Text style={bookingStyles.summaryLabel}>Guests</Text>
            <Text style={bookingStyles.summaryValue}>{guestCount}</Text>
          </View>
          {occasion && (
            <View style={bookingStyles.summaryRow}>
              <Text style={bookingStyles.summaryLabel}>Occasion</Text>
              <Text style={bookingStyles.summaryValue}>{occasion}</Text>
            </View>
          )}
        </View>

        <View style={bookingStyles.summaryCard}>
          <Text style={bookingStyles.cardTitle}>Booked Under</Text>
          <Text style={bookingStyles.bookedName}>{bookingDetails.name}</Text>
          <Text style={bookingStyles.bookedInfo}>{bookingDetails.email}</Text>
          <Text style={bookingStyles.bookedInfo}>{bookingDetails.phone}</Text>
          {bookingDetails.specialRequests && (
            <Text style={bookingStyles.bookedInfo}>📝 {bookingDetails.specialRequests}</Text>
          )}
        </View>

        {dietaryRestrictions.length > 0 && (
          <View style={bookingStyles.summaryCard}>
            <Text style={bookingStyles.cardTitle}>Dietary Restrictions</Text>
            <View style={bookingStyles.restrictionTags}>
              {dietaryRestrictions.map((r, i) => (
                <View key={i} style={bookingStyles.restrictionTag}>
                  <Text style={bookingStyles.restrictionText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={bookingStyles.overlay}>
        <View style={bookingStyles.modal}>
          {/* Header */}
          <View style={bookingStyles.header}>
            <View>
              <Text style={bookingStyles.headerTitle}>
                {step === 3 ? 'Dietary Restrictions' : 
                 step === 4 ? 'Confirm Booking' :
                 step === 2 ? 'Your Details' : 'Select Date & Time'}
              </Text>
              <Text style={bookingStyles.headerSubtitle}>{item?.name}</Text>
            </View>
            <TouchableOpacity style={bookingStyles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={bookingStyles.progress}>
            {[1, 2, 3, 4].map((s) => (
              <View key={s} style={[
                bookingStyles.progressDot,
                step >= s && bookingStyles.progressDotActive,
              ]} />
            ))}
          </View>

          {/* Content */}
          <View style={bookingStyles.content}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && null /* Rendered as separate modal */}
            {step === 4 && renderStep4()}
          </View>

          {/* Footer */}
          {step !== 3 && (
            <View style={bookingStyles.footer}>
              {step > 1 && (
                <TouchableOpacity 
                  style={bookingStyles.backBtn} 
                  onPress={() => setStep(step - 1)}
                >
                  <Text style={bookingStyles.backText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[bookingStyles.nextBtn, step === 1 && { flex: 1 }]}
                onPress={() => {
                  if (step === 1 && canProceedToStep2) setStep(2);
                  else if (step === 2 && canProceedToStep3) setStep(3);
                  else if (step === 4) handleConfirm();
                }}
                disabled={
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3) ||
                  submitting
                }
              >
                <LinearGradient 
                  colors={G.gold} 
                  style={[
                    bookingStyles.nextBtnGrad,
                    ((step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)) && 
                    bookingStyles.nextBtnDisabled,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={C.bg} />
                  ) : (
                    <Text style={bookingStyles.nextText}>
                      {step === 4 ? 'Confirm Booking' : 'Continue'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Dietary Modal (Step 3) */}
      {step === 3 && (
        <DietaryRestrictionsModal
          visible={true}
          onClose={() => setStep(2)}
          currentRestrictions={dietaryRestrictions}
          onSave={handleDietarySave}
          onSkip={handleDietarySkip}
        />
      )}
    </Modal>
  );
};

const bookingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.gold,
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.cardLight,
  },
  progressDotActive: {
    backgroundColor: C.gold,
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  backBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSec,
  },
  nextBtn: {
    flex: 2,
  },
  nextBtnGrad: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  confirmSection: {},
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  summaryLabel: {
    fontSize: 14,
    color: C.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 8,
  },
  bookedName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  bookedInfo: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 4,
  },
  restrictionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  restrictionTag: {
    backgroundColor: C.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  restrictionText: {
    fontSize: 13,
    color: C.text,
  },
});


export default {
  CalendarGrid,
  TimeSlotSelector,
  BookingDetailsEditor,
  DietaryRestrictionsModal,
  GuestCountSelector,
  OccasionSelector,
  FixedEventBookingInfo,
  BookingModal,
};
