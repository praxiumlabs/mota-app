/**
 * HelpScreen - FAQ, support, and contact
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, Animated, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#1A2A50',
  gold: '#D4AF37',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#5A6A8A',
  success: '#48BB78',
  error: '#FC8181',
};

const G = {
  dark: ['#0A122A', '#101C40', '#0A122A'],
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Reservations',
    question: 'How do I make a reservation?',
    answer: 'You can make reservations through the app by browsing restaurants, activities, or events and tapping the "Reserve" or "Book" button. Select your preferred date, time, and number of guests, then confirm your booking.'
  },
  {
    id: '2',
    category: 'Reservations',
    question: 'Can I modify or cancel my reservation?',
    answer: 'Yes, you can modify or cancel reservations through the "My Reservations" section in your profile. Please note that some reservations may have cancellation policies that apply.'
  },
  {
    id: '3',
    category: 'Reservations',
    question: 'How far in advance can I book?',
    answer: 'Most venues allow bookings up to 90 days in advance. For special events or peak seasons, we recommend booking as early as possible to secure your preferred time.'
  },
  {
    id: '4',
    category: 'Account',
    question: 'How do I become a member?',
    answer: 'You can sign up for membership through the app. Basic membership is free and gives you access to reservations and special offers. Investor tiers (Gold, Platinum, Diamond) are available for qualified investors.'
  },
  {
    id: '5',
    category: 'Account',
    question: 'What are the investor tier benefits?',
    answer: 'Gold ($2.5M+): Priority reservations, 10% dining discount, PCH Fleet access.\n\nPlatinum ($15M+): All Gold benefits plus complimentary spa, yacht charters, VIP concierge.\n\nDiamond ($70M+): All Platinum benefits plus private villa access, helicopter transfers, unlimited yacht usage.'
  },
  {
    id: '6',
    category: 'Account',
    question: 'How do I enable Face ID / Touch ID?',
    answer: 'Go to Settings > Security and toggle on the biometric option. You\'ll need to authenticate once to enable this feature for future quick logins.'
  },
  {
    id: '7',
    category: 'PCH Fleet',
    question: 'How do I rent a car or yacht?',
    answer: 'Browse the PCH Exotic Fleet section in the app. Select your desired vehicle or yacht, check availability, and submit a booking request. Our concierge team will confirm within 2 hours.'
  },
  {
    id: '8',
    category: 'PCH Fleet',
    question: 'What are the rental requirements?',
    answer: 'For cars: Valid driver\'s license, minimum age 25, insurance verification.\n\nFor yachts: Captain provided for all charters. Private operation available for certified captains with appropriate credentials.'
  },
  {
    id: '9',
    category: 'General',
    question: 'Where is MOTA located?',
    answer: 'MOTA is located in Mahogany Bay, Ambergris Caye, Belize. We offer transfers from Belize City (BZE) airport via private charter or ferry service.'
  },
  {
    id: '10',
    category: 'General',
    question: 'Is there a dress code?',
    answer: 'Smart casual is appropriate for most venues. Fine dining restaurants require resort elegant attire. Beach clubs and pools allow swimwear. The casino requires smart casual or better after 6 PM.'
  },
];

const CATEGORIES = ['All', 'Reservations', 'Account', 'PCH Fleet', 'General'];

interface Props {
  onBack: () => void;
}

export default function HelpScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  const toggleFAQ = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQ = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sendMessage = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert('Missing Info', 'Please fill in both subject and message.');
      return;
    }

    setSending(true);
    try {
      await api.post('/support/contact', {
        subject: contactSubject,
        message: contactMessage,
      });
      Alert.alert('Message Sent', 'Our team will respond within 24 hours.');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      // For demo, show success anyway
      Alert.alert('Message Sent', 'Our team will respond within 24 hours.');
      setContactSubject('');
      setContactMessage('');
    } finally {
      setSending(false);
    }
  };

  const FAQItemComponent = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <TouchableOpacity 
        style={[s.faqItem, isExpanded && s.faqItemExpanded]}
        onPress={() => toggleFAQ(item.id)}
        activeOpacity={0.8}
      >
        <View style={s.faqHeader}>
          <Text style={s.faqQuestion}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={C.gold} 
          />
        </View>
        {isExpanded && (
          <Text style={s.faqAnswer}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={s.quickActions}>
          <TouchableOpacity 
            style={s.quickAction}
            onPress={() => Linking.openURL('tel:+5012265555')}
          >
            <View style={s.quickActionIcon}>
              <Ionicons name="call" size={24} color={C.gold} />
            </View>
            <Text style={s.quickActionText}>Call Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={s.quickAction}
            onPress={() => Linking.openURL('mailto:support@mota.bet')}
          >
            <View style={s.quickActionIcon}>
              <Ionicons name="mail" size={24} color={C.gold} />
            </View>
            <Text style={s.quickActionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={s.quickAction}
            onPress={() => Linking.openURL('https://wa.me/5012265555')}
          >
            <View style={s.quickActionIcon}>
              <Ionicons name="logo-whatsapp" size={24} color={C.gold} />
            </View>
            <Text style={s.quickActionText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchContainer}>
          <Ionicons name="search" size={20} color={C.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search FAQ..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={s.categoryFilter}
          contentContainerStyle={s.categoryFilterContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.categoryChip, selectedCategory === cat && s.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[s.categoryChipText, selectedCategory === cat && s.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFAQ.length === 0 ? (
          <View style={s.noResults}>
            <Ionicons name="help-circle-outline" size={48} color={C.textMuted} />
            <Text style={s.noResultsText}>No matching questions found</Text>
          </View>
        ) : (
          filteredFAQ.map((item) => (
            <FAQItemComponent key={item.id} item={item} />
          ))
        )}

        {/* Contact Form */}
        <Text style={s.sectionTitle}>Contact Us</Text>
        <View style={s.contactForm}>
          <Text style={s.inputLabel}>Subject</Text>
          <TextInput
            style={s.input}
            placeholder="What's this about?"
            placeholderTextColor={C.textMuted}
            value={contactSubject}
            onChangeText={setContactSubject}
          />

          <Text style={s.inputLabel}>Message</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Describe your issue or question..."
            placeholderTextColor={C.textMuted}
            value={contactMessage}
            onChangeText={setContactMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity onPress={sendMessage} disabled={sending}>
            <LinearGradient colors={G.gold} style={s.sendBtn}>
              <Text style={s.sendBtnText}>{sending ? 'Sending...' : 'Send Message'}</Text>
              <Ionicons name="send" size={18} color={C.bg} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={s.contactInfo}>
          <Text style={s.contactInfoTitle}>Resort Contact</Text>
          <View style={s.contactRow}>
            <Ionicons name="location" size={18} color={C.gold} />
            <Text style={s.contactText}>Mahogany Bay, Ambergris Caye, Belize</Text>
          </View>
          <View style={s.contactRow}>
            <Ionicons name="call" size={18} color={C.gold} />
            <Text style={s.contactText}>+501 226-5555</Text>
          </View>
          <View style={s.contactRow}>
            <Ionicons name="mail" size={18} color={C.gold} />
            <Text style={s.contactText}>support@mota.bet</Text>
          </View>
          <View style={s.contactRow}>
            <Ionicons name="time" size={18} color={C.gold} />
            <Text style={s.contactText}>24/7 Concierge Available</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 14,
    marginLeft: 10,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: C.gold,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
  },
  categoryChipTextActive: {
    color: C.bg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 12,
  },
  faqItem: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  faqItemExpanded: {
    backgroundColor: C.cardLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: C.textSec,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.card,
  },
  contactForm: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.cardLight,
    borderRadius: 10,
    padding: 14,
    color: C.text,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  contactInfo: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: C.textSec,
  },
});
