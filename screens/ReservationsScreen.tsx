/**
 * ReservationsScreen - View and manage user reservations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Alert, Image, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
  warning: '#F6AD55',
  info: '#63B3ED',
};

const G = {
  dark: ['#0A122A', '#101C40', '#0A122A'],
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
  overlay: ['transparent', 'rgba(10,18,42,0.8)', 'rgba(10,18,42,0.95)'],
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80';

interface Reservation {
  _id: string;
  type: string;
  itemId: any;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

interface Props {
  onBack: () => void;
}

export default function ReservationsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const loadReservations = useCallback(async () => {
    try {
    const response = await api.get('/reservations/my');
    const data = response.data?.reservations || response.data || [];
    setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Error loading reservations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const cancelReservation = (id: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/reservations/${id}/cancel`);
              loadReservations();
              Alert.alert('Cancelled', 'Your reservation has been cancelled.');
            } catch (err) {
              Alert.alert('Error', 'Could not cancel reservation. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getFilteredReservations = () => {
    const now = new Date();
    return reservations.filter(r => {
      const resDate = new Date(r.date);
      if (filter === 'upcoming') return resDate >= now && r.status !== 'cancelled';
      if (filter === 'past') return resDate < now || r.status === 'completed';
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filter === 'upcoming' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return C.success;
      case 'pending': return C.warning;
      case 'cancelled': return C.error;
      case 'completed': return C.info;
      default: return C.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'ellipse';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'activity': return 'compass';
      case 'lodging': return 'bed';
      case 'event': return 'calendar';
      case 'fleet': return 'car-sport';
      case 'spa': return 'leaf';
      default: return 'bookmark';
    }
  };

  const filtered = getFilteredReservations();

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Reservations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={s.filterTabs}>
        {(['upcoming', 'past', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={s.loadingText}>Loading reservations...</Text>
        </View>
      ) : (
        <ScrollView
          style={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
          }
        >
          {filtered.length === 0 ? (
            <View style={s.emptyContainer}>
              <View style={s.emptyIcon}>
                <Ionicons name="calendar-outline" size={48} color={C.textMuted} />
              </View>
              <Text style={s.emptyTitle}>No Reservations</Text>
              <Text style={s.emptyText}>
                {filter === 'upcoming' 
                  ? "You don't have any upcoming reservations."
                  : filter === 'past'
                  ? "You don't have any past reservations."
                  : "You haven't made any reservations yet."}
              </Text>
            </View>
          ) : (
            filtered.map((reservation) => (
              <View key={reservation._id} style={s.reservationCard}>
                <View style={s.cardHeader}>
                  <View style={s.typeIconContainer}>
                    <Ionicons name={getTypeIcon(reservation.type) as any} size={20} color={C.gold} />
                  </View>
                  <View style={s.cardHeaderInfo}>
                    <Text style={s.cardTitle}>
                      {reservation.itemId?.name || `${reservation.type} Reservation`}
                    </Text>
                    <Text style={s.cardType}>{reservation.type}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                    <Ionicons name={getStatusIcon(reservation.status) as any} size={14} color={getStatusColor(reservation.status)} />
                    <Text style={[s.statusText, { color: getStatusColor(reservation.status) }]}>
                      {reservation.status}
                    </Text>
                  </View>
                </View>

                <View style={s.cardDetails}>
                  <View style={s.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={C.textSec} />
                    <Text style={s.detailText}>{formatDate(reservation.date)}</Text>
                  </View>
                  <View style={s.detailRow}>
                    <Ionicons name="time-outline" size={16} color={C.textSec} />
                    <Text style={s.detailText}>{reservation.time}</Text>
                  </View>
                  <View style={s.detailRow}>
                    <Ionicons name="people-outline" size={16} color={C.textSec} />
                    <Text style={s.detailText}>{reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}</Text>
                  </View>
                </View>

                {reservation.notes && (
                  <View style={s.notesContainer}>
                    <Text style={s.notesLabel}>Notes:</Text>
                    <Text style={s.notesText}>{reservation.notes}</Text>
                  </View>
                )}

                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                  <View style={s.cardActions}>
                    <TouchableOpacity 
                      style={s.cancelBtn}
                      onPress={() => cancelReservation(reservation._id)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={C.error} />
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.modifyBtn}>
                      <Ionicons name="create-outline" size={18} color={C.gold} />
                      <Text style={s.modifyBtnText}>Modify</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.card,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: C.gold,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
  },
  filterTabTextActive: {
    color: C.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: C.textSec,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  reservationCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  cardType: {
    fontSize: 12,
    color: C.textMuted,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: C.textSec,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: C.cardLight,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: C.textSec,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.error + '15',
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.error,
  },
  modifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.gold + '15',
    gap: 6,
  },
  modifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gold,
  },
});
