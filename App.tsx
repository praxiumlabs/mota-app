/**
 * MOTA - Macau of the Americas
 * Premium Casino Resort App
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar, ActivityIndicator, RefreshControl, FlatList, TextInput, Modal, Alert, ImageBackground, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomSheet from './components/BottomSheet';
import AuthModal from './components/AuthModal';
import api from './services/api';

const { width, height } = Dimensions.get('window');

// PREMIUM COLOR PALETTE
const C = {
  bg: '#0A122A', card: '#101C40', cardLight: '#152347',
  gold: '#D4AF37', goldLight: '#E8C547', goldDark: '#B8952F', goldMuted: 'rgba(212,175,55,0.15)',
  text: '#F5F5F5', textSec: '#A0AEC0', textMuted: '#718096',
  success: '#48BB78', error: '#FC8181', blue: '#4299E1', purple: '#9F7AEA', cyan: '#38B2AC',
};

const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'] as const,
  dark: ['#101C40', '#0A122A'] as const,
  card: ['#152347', '#101C40'] as const,
  overlay: ['transparent', 'rgba(10,18,42,0.7)', 'rgba(10,18,42,0.98)'] as const,
};

// DATA
const HeroImages = ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200'];

const Rooms = [
  { id: '1', name: 'Oceanfront Suite', type: 'Suite', beds: 'King', size: '850 sq ft', price: 599, image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800', amenities: ['Ocean View', 'Butler Service'] },
  { id: '2', name: 'Overwater Villa', type: 'Villa', beds: '2 Kings', size: '1,800 sq ft', price: 1299, image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', amenities: ['Glass Floor', 'Private Pool'] },
  { id: '3', name: 'Beachfront Bungalow', type: 'Bungalow', beds: 'King', size: '1,200 sq ft', price: 899, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', amenities: ['Beach Access', 'Hammock'] },
  { id: '4', name: 'Presidential Villa', type: 'Villa', beds: '3 Kings', size: '4,500 sq ft', price: 3999, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', amenities: ['Private Chef', 'Helipad'] },
];

const Cars = [
  { id: '1', name: 'Lamborghini Huracán', price: 1500, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600', cat: 'Supercar' },
  { id: '2', name: 'Ferrari 488 GTB', price: 1800, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600', cat: 'Supercar' },
  { id: '3', name: 'Rolls-Royce Ghost', price: 2000, image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600', cat: 'Luxury' },
  { id: '4', name: 'Bentley Continental', price: 1200, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', cat: 'Luxury' },
  { id: '5', name: 'McLaren 720S', price: 2200, image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600', cat: 'Supercar' },
  { id: '6', name: 'Porsche 911 Turbo', price: 900, image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600', cat: 'Sports' },
];

const Amenities = [
  { icon: 'fitness-outline', title: 'Spa & Wellness', desc: 'Full-service spa', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800' },
  { icon: 'game-controller-outline', title: 'Casino & Gaming', desc: 'Tables & slots', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800' },
  { icon: 'boat-outline', title: 'Marina & Pier', desc: 'Private dock', img: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800' },
  { icon: 'water-outline', title: 'Beach Club', desc: 'Exclusive access', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800' },
];

// COMPONENTS
const ImageCarousel = ({ images, h = 400 }: { images: string[]; h?: number }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef<ScrollView>(null);
  useEffect(() => { const t = setInterval(() => { const n = (idx + 1) % images.length; setIdx(n); ref.current?.scrollTo({ x: n * width, animated: true }); }, 4000); return () => clearInterval(t); }, [idx]);
  return (
    <View style={{ height: h }}>
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {images.map((img, i) => <ImageBackground key={i} source={{ uri: img }} style={{ width, height: h }}><LinearGradient colors={G.overlay} style={StyleSheet.absoluteFill} /></ImageBackground>)}
      </ScrollView>
      <View style={s.dots}>{images.map((_, i) => <View key={i} style={[s.dot, i === idx && s.dotActive]} />)}</View>
    </View>
  );
};

const GoldBtn = ({ title, onPress, icon, lg, loading, style }: any) => (
  <TouchableOpacity onPress={onPress} disabled={loading} style={style} activeOpacity={0.85}>
    <LinearGradient colors={G.gold} style={[s.goldBtn, lg && s.goldBtnLg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      {loading ? <ActivityIndicator color={C.bg} /> : <>{icon ? <Ionicons name={icon} size={lg ? 22 : 18} color={C.bg} style={{ marginRight: 8 }} /> : null}<Text style={[s.goldBtnText, lg && s.goldBtnTextLg]}>{title}</Text></>}
    </LinearGradient>
  </TouchableOpacity>
);

const Stars = ({ r, sz = 14 }: { r: number; sz?: number }) => (
  <View style={s.stars}>{[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name={i <= Math.floor(r) ? 'star' : 'star-outline'} size={sz} color={C.goldLight} style={{ marginRight: 2 }} />)}<Text style={[s.starsText, { fontSize: sz }]}>{r.toFixed(1)}</Text></View>
);

const Price = ({ orig, disc, sz = 'md' }: { orig: number; disc?: number; sz?: string }) => {
  const fs = sz === 'lg' ? 26 : sz === 'sm' ? 16 : 20;
  return <View style={s.priceRow}>{disc && disc < orig ? <><Text style={[s.priceOld, { fontSize: fs * 0.7 }]}>${orig}</Text><Text style={[s.priceNew, { fontSize: fs }]}>${disc}</Text></> : <Text style={[s.priceReg, { fontSize: fs }]}>${orig}</Text>}</View>;
};

const Badge = ({ text, color = C.gold }: { text: string; color?: string }) => <View style={[s.badge, { backgroundColor: `${color}25` }]}><Text style={[s.badgeText, { color }]}>{text}</Text></View>;

const SecHeader = ({ title, sub, action, onAction }: any) => (
  <View style={s.secHeader}><View><Text style={s.secTitle}>{title}</Text>{sub ? <Text style={s.secSub}>{sub}</Text> : null}</View>{action ? <TouchableOpacity onPress={onAction}><Text style={s.secAction}>{action} →</Text></TouchableOpacity> : null}</View>
);

const GoldCard = ({ tier, value, returns, disc, name, onPress }: any) => {
  const colors: any = { 
    silver: ['#E8E8E8', '#C0C0C0', '#A8A8A8'], 
    gold: ['#F7E98E', '#D4AF37', '#AA8C2C'], 
    platinum: ['#E8E8E8', '#E5E4E2', '#B8B8B8'], 
    diamond: ['#E0F7FF', '#B9F2FF', '#87CEEB'], 
    black: ['#4A4A4A', '#1A1A1A', '#000000'], 
    founders: ['#F7E98E', '#D4AF37', '#6B46C1'] 
  };
  const tierColors = colors[tier] || colors.gold;
  const isLight = ['silver', 'platinum', 'diamond'].includes(tier);
  const textColor = isLight ? '#1A1A1A' : '#FFFFFF';
  const textSecColor = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
  
  // Simple QR code pattern (5x5 grid)
  const QRCode = () => (
    <View style={s.qrCode}>
      {[0,1,2,3,4].map(row => (
        <View key={row} style={s.qrRow}>
          {[0,1,2,3,4].map(col => {
            // Create a deterministic pattern based on position
            const filled = (row === 0 || row === 4 || col === 0 || col === 4) || 
                          (row === 2 && col === 2) ||
                          ((row === 1 || row === 3) && (col === 1 || col === 3));
            return <View key={col} style={[s.qrCell, filled && { backgroundColor: textColor }]} />;
          })}
        </View>
      ))}
    </View>
  );
  
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={odPress} style={s.goldCardWrap}>
      <LinearGradient colors={tierColors} style={s.goldCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.goldCardShine} />
        <View style={s.goldCardContent}>
          <View style={s.goldCardHeader}>
            <View>
              <Text style={[s.goldCardLogo, { color: textColor }]}>MOTA</Text>
              <Text style={[s.goldCardTier, { color: textSecColor }]}>{tier?.toUpperCase()} INVESTOR</Text>
            </View>
            <QRCode />
          </View>
          <View style={s.goldCardChip}>
            {[1, 2, 3, 4].map(i => <View key={i} style={[s.goldCardChipLine, { backgroundColor: textSecColor }]} />)}
          </View>
          <View style={s.goldCardStats}>
            <View>
              <Text style={[s.goldCardLabel, { color: textSecColor }]}>PORTFOLIO VALUE</Text>
              <Text style={[s.goldCardValue, { color: textColor }]}>${(value || 0).toLocaleString()}</Text>
            </View>
            <View>
              <Text style={[s.goldCardLabel, { color: textSecColor }]}>RETURNS</Text>
              <Text style={[s.goldCardValue, { color: '#4ADE80' }]}>+{returns || 0}%</Text>
            </View>
          </View>
          <View style={s.goldCardFooter}>
            <View>
              <Text style={[s.goldCardDisc, { color: textColor }]}>{disc}% OFF ALL BOOKINGS</Text>
              {name ? <Text style={[s.goldCardName, { color: textSecColor }]}>{name}</Text> : null}
            </View>
            <MaterialCommunityIcons name="contactless-payment" size={28} color={textSecColor} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ReservationModal = ({ visible, onClose, item, type }: any) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [loading, setLoading] = useState(false);
  const handleReserve = async () => { if (!date || !time) { Alert.alert('Missing Info', 'Select date and time'); return; } setLoading(true); await new Promise(r => setTimeout(r, 1500)); setLoading(false); Alert.alert('✨ Confirmed!', `Your ${type} at ${item?.name} is booked for ${date} at ${time}.`, [{ text: 'Perfect!', onPress: onClose }]); };
  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.resModal}>
          <LinearGradient colors={G.dark} style={StyleSheet.absoluteFill} />
          <View style={s.resHeader}><View><Text style={s.resTitle}>Make a Reservation</Text><Text style={s.resSub}>{item.name}</Text></View><TouchableOpacity onPress={onClose} style={s.closeBtn}><Ionicons name="close" size={24} color={C.text} /></TouchableOpacity></View>
          <ScrollView style={s.resContent} showsVerticalScrollIndicator={false}>
            <Text style={s.inputLabel}>Date</Text>
            <View style={s.dateRow}>{['Today', 'Tomorrow', 'Custom'].map(d => <TouchableOpacity key={d} style={[s.dateOpt, date === d && s.dateOptActive]} onPress={() => setDate(d)}>{date === d && <LinearGradient colors={G.gold} style={StyleSheet.absoluteFill} />}<Text style={[s.dateOptText, date === d && s.dateOptTextActive]}>{d}</Text></TouchableOpacity>)}</View>
            <Text style={s.inputLabel}>Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>{['12:00 PM', '1:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'].map(t => <TouchableOpacity key={t} style={[s.timeOpt, time === t && s.timeOptActive]} onPress={() => setTime(t)}>{time === t && <LinearGradient colors={G.gold} style={StyleSheet.absoluteFill} />}<Text style={[s.timeOptText, time === t && s.timeOptTextActive]}>{t}</Text></TouchableOpacity>)}</ScrollView>
            <Text style={s.inputLabel}>Guests</Text>
            <View style={s.guestSel}><TouchableOpacity style={s.guestBtn} onPress={() => setGuests(Math.max(1, parseInt(guests) - 1).toString())}><Ionicons name="remove" size={20} color={C.gold} /></TouchableOpacity><Text style={s.guestCount}>{guests}</Text><TouchableOpacity style={s.guestBtn} onPress={() => setGuests((parseInt(guests) + 1).toString())}><Ionicons name="add" size={20} color={C.gold} /></TouchableOpacity></View>
            <View style={s.summaryCard}><View style={s.summaryRow}><Text style={s.summaryLabel}>Location</Text><Text style={s.summaryValue}>{item.name}</Text></View><View style={s.summaryRow}><Text style={s.summaryLabel}>Date & Time</Text><Text style={s.summaryValue}>{date || '--'} at {time || '--'}</Text></View><View style={s.summaryRow}><Text style={s.summaryLabel}>Party Size</Text><Text style={s.summaryValue}>{guests} guests</Text></View></View>
          </ScrollView>
          <View style={s.resFooter}><GoldBtn title="Confirm Reservation" onPress={handleReserve} lg loading={loading} style={{ flex: 1 }} /></View>
        </View>
      </View>
    </Modal>
  );
};

// HOME SCREEN
function HomeScreen({ onShowAuth, onNavigate }: { onShowAuth: () => void; onNavigate: (tab: string, params?: any) => void }) {
  const insets = useSafeAreaInsets();
  const { user, isInvestor, getDiscountPercent, refreshUser } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [resType, setResType] = useState('');
  const [showRes, setShowRes] = useState(false);

  const isLoggedIn = !!user;
  const disc = getDiscountPercent();
  const getPrice = (p: number) => isLoggedIn ? Math.round(p * (1 - disc / 100)) : p;

  const fetchData = useCallback(async () => {
    try { 
      await refreshUser();
      const [r, a, e] = await Promise.all([api.getRestaurants().catch(() => []), api.getActivities().catch(() => []), api.getEvents().catch(() => [])]); 
      setRestaurants(r || []); setActivities(a || []); setEvents(e || []); 
    } finally { setLoading(false); setRefreshing(false); }
  }, [refreshUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openRes = (item: any, type: string) => { if (!isLoggedIn) { onShowAuth(); return; } setSelectedItem(item); setResType(type); setShowRes(true); };

  if (loading) return <View style={s.loadingContainer}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><MaterialCommunityIcons name="diamond-stone" size={64} color={C.gold} /><Text style={s.loadingLogo}>MOTA</Text><Text style={s.loadingTag}>Macau of the Americas</Text><ActivityIndicator color={C.gold} style={{ marginTop: 30 }} /></View>;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.gold} />}>
        {/* Hero */}
        <View>
          <ImageCarousel images={HeroImages} h={height * 0.55} />
          <View style={[s.heroHeader, { paddingTop: insets.top + 10 }]}>
            <View><Text style={s.heroGreet}>{isLoggedIn ? 'Welcome back,' : 'Welcome to'}</Text><Text style={s.heroLogo}>MOTA</Text>{isLoggedIn && user?.name ? <Text style={s.heroName}>{user.name.split(' ')[0]}</Text> : null}</View>
            <View style={s.heroActions}>
              <TouchableOpacity style={s.heroIconBtn} onPress={() => Alert.alert('Notifications')}><Ionicons name="notifications-outline" size={24} color={C.text} /></TouchableOpacity>
              <TouchableOpacity style={s.heroProfileBtn} onPress={() => isLoggedIn ? onNavigate('profile') : onShowAuth()}>{isLoggedIn ? <LinearGradient colors={G.gold} style={s.heroProfileGrad}><Text style={s.heroProfileInit}>{user?.name?.[0] || 'U'}</Text></LinearGradient> : <View style={s.heroProfileOut}><Ionicons name="person-add" size={20} color={C.gold} /></View>}</TouchableOpacity>
            </View>
          </View>
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Crown Jewel of the Caribbean</Text>
            <Text style={s.heroSubtitle}>$2.5B Luxury Casino Resort • Belize</Text>
            <View style={s.heroStats}>{[{ v: '$6B', l: 'Total Project' }, { v: '2,000+', l: 'Rooms' }, { v: '400', l: 'Acres' }].map((st, i) => <React.Fragment key={i}>{i > 0 && <View style={s.heroStatDiv} />}<View style={s.heroStat}><Text style={s.heroStatV}>{st.v}</Text><Text style={s.heroStatL}>{st.l}</Text></View></React.Fragment>)}</View>
          </View>
        </View>

        {/* Gold Card / CTA */}
        <View style={{ paddingHorizontal: 20, marginTop: -30, marginBottom: 20 }}>
          {isLoggedIn && isInvestor && user?.investorTier ? (
            <GoldCard tier={user.investorTier} value={user.portfolioValue} returns={12} disc={disc} name={user.name} onPress={() => onNavigate('invest')} />
          ) : isLoggedIn && !isInvestor ? (
            <TouchableOpacity onPress={() => onNavigate('profile')} activeOpacity={0.9}><LinearGradient colors={G.card} style={s.memberCard}><View style={s.memberIcon}><Ionicons name="star" size={24} color={C.blue} /></View><View style={s.memberContent}><Text style={s.memberTitle}>MOTA MEMBER</Text><Text style={s.memberSub}>{disc}% off all bookings</Text></View><Ionicons name="chevron-forward" size={24} color={C.blue} /></LinearGradient></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onShowAuth} activeOpacity={0.9}><LinearGradient colors={G.gold} style={s.guestCta}><MaterialCommunityIcons name="account-plus" size={36} color={C.bg} /><View style={s.guestCtaContent}><Text style={s.guestCtaTitle}>Create Free Account</Text><Text style={s.guestCtaSub}>Book restaurants, save favorites & more</Text></View><Ionicons name="arrow-forward" size={24} color={C.bg} /></LinearGradient></TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={s.quickGrid}>{[{ icon: 'bed-outline', label: 'Rooms', sub: '160 Keys', color: C.gold }, { icon: 'restaurant-outline', label: 'Dining', sub: '5 Venues', color: '#ED8936' }, { icon: 'water-outline', label: 'Activities', sub: '12 Experiences', color: C.cyan }, { icon: 'diamond-outline', label: 'Casino', sub: 'VIP Gaming', color: C.purple }].map((item, i) => <TouchableOpacity key={i} style={s.quickAction} onPress={() => onNavigate('explore', { tab: item.label.toLowerCase() })} activeOpacity={0.8}><LinearGradient colors={G.card} style={s.quickActionCard}><View style={[s.quickActionIcon, { backgroundColor: `${item.color}20` }]}><Ionicons name={item.icon as any} size={26} color={item.color} /></View><Text style={s.quickActionLabel}>{item.label}</Text><Text style={s.quickActionSub}>{item.sub}</Text></LinearGradient></TouchableOpacity>)}</View>

        {/* Accommodations */}
        <View style={s.section}>
          <SecHeader title="Luxury Accommodations" sub="160 Keys • Suites & Villas" action="View All" onAction={() => onNavigate('explore', { tab: 'rooms' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {Rooms.map((room, idx) => <TouchableOpacity key={room.id} style={[s.roomCard, idx === 0 && { marginLeft: 20 }]} activeOpacity={0.9} onPress={() => openRes(room, 'room')}><ImageBackground source={{ uri: room.image }} style={s.roomImage} imageStyle={{ borderRadius: 20 }}><LinearGradient colors={G.overlay} style={s.roomOverlay}><Badge text={room.type} /><View><Text style={s.roomName}>{room.name}</Text><Text style={s.roomDetails}>{room.beds} • {room.size}</Text><View style={s.roomAmenities}>{room.amenities.map((a, i) => <View key={i} style={s.amenityTag}><Text style={s.amenityText}>{a}</Text></View>)}</View><View style={s.roomFooter}><Price orig={room.price} disc={getPrice(room.price)} /><Text style={s.perNight}>/night</Text></View></View></LinearGradient></ImageBackground></TouchableOpacity>)}
          </ScrollView>
        </View>

        {/* Dining */}
        <View style={s.section}>
          <SecHeader title="Signature Dining" sub="World-class cuisine" action="View All" onAction={() => onNavigate('explore', { tab: 'dining' })} />
          {restaurants.length === 0 ? <View style={{ paddingHorizontal: 20 }}><LinearGradient colors={G.card} style={s.placeholderCard}><Image source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }} style={s.placeholderImg} /><View style={s.placeholderContent}><Text style={s.placeholderTitle}>Premium F&B Venues</Text><Text style={s.placeholderText}>2 signature restaurants • Rooftop bar • Beach club</Text></View></LinearGradient></View>
           : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>{restaurants.map((r: any, idx: number) => <TouchableOpacity key={r._id} style={[s.diningCard, idx === 0 && { marginLeft: 20 }]} activeOpacity={0.9} onPress={() => openRes(r, 'restaurant')}><ImageBackground source={{ uri: r.image }} style={s.diningImg} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={G.overlay} style={s.diningOverlay}><Stars r={r.rating} /><Text style={s.diningName}>{r.name}</Text><Text style={s.diningCat}>{r.category}</Text><View style={s.diningFooter}><Price orig={r.regularPrice} disc={getPrice(r.regularPrice)} sz="sm" /><TouchableOpacity style={s.reserveBtn}><Text style={s.reserveBtnText}>Reserve</Text></TouchableOpacity></View></LinearGradient></ImageBackground></TouchableOpacity>)}</ScrollView>}
        </View>

        {/* PCH Exotics */}
        <View style={s.section}>
          <SecHeader title="PCH Exotics" sub="Luxury car rentals" action="View Fleet" onAction={() => onNavigate('explore', { tab: 'rentals' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {Cars.map((car, idx) => <TouchableOpacity key={car.id} style={[s.carCard, idx === 0 && { marginLeft: 20 }]} activeOpacity={0.9} onPress={() => Alert.alert(car.name, `$${car.price}/day\n\nContact PCH Exotics to book.`)}><LinearGradient colors={G.card} style={s.carCardInner}><Image source={{ uri: car.image }} style={s.carImg} /><View style={s.carContent}><Badge text={car.cat} /><Text style={s.carName}>{car.name}</Text><View style={s.carFooter}><Text style={s.carPrice}>${car.price}</Text><Text style={s.carPriceUnit}>/day</Text></View></View></LinearGradient></TouchableOpacity>)}
          </ScrollView>
        </View>

        {/* Amenities */}
        <View style={s.section}>
          <SecHeader title="Premium Amenities" sub="World-class facilities" />
          <View style={s.amenitiesGrid}>{Amenities.map((a, i) => <TouchableOpacity key={i} style={s.amenityGridCard} activeOpacity={0.9}><ImageBackground source={{ uri: a.img }} style={s.amenityGridImg} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={['transparent', 'rgba(10,18,42,0.9)']} style={s.amenityGridOverlay}><View style={s.amenityGridIcon}><Ionicons name={a.icon as any} size={24} color={C.gold} /></View><Text style={s.amenityGridTitle}>{a.title}</Text><Text style={s.amenityGridDesc}>{a.desc}</Text></LinearGradient></ImageBackground></TouchableOpacity>)}</View>
        </View>

        {/* Activities */}
        <View style={s.section}>
          <SecHeader title="Curated Experiences" sub="Unforgettable adventures" action="View All" onAction={() => onNavigate('explore', { tab: 'activities' })} />
          {activities.length === 0 ? <View style={{ paddingHorizontal: 20 }}>{[{ name: 'Scuba Diving', price: 250, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' }, { name: 'Yacht Charter', price: 1500, img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600' }].map((a, i) => <TouchableOpacity key={i} style={s.actListCard} activeOpacity={0.9}><Image source={{ uri: a.img }} style={s.actListImg} /><View style={s.actListContent}><Text style={s.actListName}>{a.name}</Text><Text style={s.actListPrice}>From ${a.price}</Text></View><Ionicons name="chevron-forward" size={20} color={C.gold} /></TouchableOpacity>)}</View>
           : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>{activities.map((a: any, idx: number) => <TouchableOpacity key={a._id} style={[s.actCard, idx === 0 && { marginLeft: 20 }]} activeOpacity={0.9} onPress={() => openRes(a, 'activity')}><ImageBackground source={{ uri: a.image }} style={s.actImg} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={G.overlay} style={s.actOverlay}>{a.duration ? <Badge text={a.duration} color={C.cyan} /> : null}<View>{a.rating ? <Stars r={a.rating} /> : null}<Text style={s.actName}>{a.name}</Text><Text style={s.actCat}>{a.category || ' '}</Text><Price orig={a.regularPrice} disc={getPrice(a.regularPrice)} sz="sm" /></View></LinearGradient></ImageBackground></TouchableOpacity>)}</ScrollView>}
        </View>

        {/* Events */}
        <View style={s.section}>
          <SecHeader title="Upcoming Events" sub="VIP gatherings" action="View All" onAction={() => onNavigate('explore', { tab: 'events' })} />
          {events.length === 0 ? <View style={{ paddingHorizontal: 20 }}><LinearGradient colors={G.card} style={s.eventPlaceholder}><Ionicons name="calendar-outline" size={48} color={C.textMuted} /><Text style={s.eventPlaceholderText}>Events coming soon</Text></LinearGradient></View>
           : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}>{events.slice(0, 5).map((e: any, idx: number) => <TouchableOpacity key={e._id} style={[s.eventCardH, idx > 0 && { marginLeft: 14 }]} activeOpacity={0.9}><ImageBackground source={{ uri: e.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' }} style={s.eventImgH} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={['transparent', 'rgba(10,18,42,0.95)']} style={s.eventOverlayH}>{e.isVipOnly ? <View style={s.vipBadge}><Ionicons name="diamond" size={14} color={C.gold} /><Text style={s.vipBadgeText}>VIP</Text></View> : null}<View style={s.eventContentH}><View style={s.eventDateBox}><Text style={s.eventDateDay}>{new Date(e.date).getDate()}</Text><Text style={s.eventDateMonth}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text></View><View style={s.eventDetailsH}><Text style={s.eventNameH} numberOfLines={1}>{e.name}</Text><View style={s.eventMeta}><Ionicons name="location-outline" size={12} color={C.textSec} /><Text style={s.eventVenueH} numberOfLines={1}>{e.venue || 'MOTA Resort'}</Text></View></View></View></LinearGradient></ImageBackground></TouchableOpacity>)}</ScrollView>}
        </View>

        {/* Investor CTA */}
        {isLoggedIn && !isInvestor ? <View style={{ paddingHorizontal: 20, marginBottom: 24 }}><TouchableOpacity onPress={() => onNavigate('invest')} activeOpacity={0.9}><LinearGradient colors={G.card} style={s.invCta}><View style={s.invCtaGlow} /><View style={s.invCtaRow}><View style={s.invCtaIcon}><MaterialCommunityIcons name="diamond-stone" size={40} color={C.gold} /></View><View style={s.invCtaContent}><Text style={s.invCtaTitle}>Become an Investor</Text><Text style={s.invCtaSub}>Up to 50% off • VIP access</Text></View></View><GoldBtn title="Learn More" icon="arrow-forward" onPress={() => onNavigate('invest')} /></LinearGradient></TouchableOpacity></View> : null}

        {/* Metrics */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={s.metricsTitle}>Key Metrics</Text>
          <View style={s.metricsGrid}>{[{ l: 'Crown Jewel Core', v: '$2.5B' }, { l: 'Total Project', v: '$6B' }, { l: 'Land Area', v: '400 Acres' }, { l: 'Hotel Rooms', v: '2,000+' }].map((m, i) => <View key={i} style={s.metricCard}><Text style={s.metricValue}>{m.v}</Text><Text style={s.metricLabel}>{m.l}</Text></View>)}</View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <ReservationModal visible={showRes} onClose={() => setShowRes(false)} item={selectedItem} type={resType} />
    </View>
  );
}

// EXPLORE SCREEN
function ExploreScreen({ onShowAuth, initialTab }: { onShowAuth: () => void; initialTab?: string }) {
  const insets = useSafeAreaInsets();
  const { user, getDiscountPercent } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'rooms');
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRes, setShowRes] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [resType, setResType] = useState('');

  const isLoggedIn = !!user;
  const disc = getDiscountPercent();
  const getPrice = (p: number) => isLoggedIn ? Math.round(p * (1 - disc / 100)) : p;

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const [r, a, e] = await Promise.all([api.getRestaurants().catch(() => []), api.getActivities().catch(() => []), api.getEvents().catch(() => [])]); setRestaurants(r || []); setActivities(a || []); setEvents(e || []); } finally { setLoading(false); } };
  const openRes = (item: any, type: string) => { if (!isLoggedIn) { onShowAuth(); return; } setSelectedItem(item); setResType(type); setShowRes(true); };

  const tabs = [{ id: 'rooms', label: 'Rooms', icon: 'bed-outline' }, { id: 'dining', label: 'Dining', icon: 'restaurant-outline' }, { id: 'activities', label: 'Activities', icon: 'water-outline' }, { id: 'rentals', label: 'Rentals', icon: 'car-sport-outline' }, { id: 'events', label: 'Events', icon: 'calendar-outline' }];

  const getItems = () => {
    let items: any[] = [];
    if (activeTab === 'rooms') items = [...Rooms.map(r => ({ ...r, _id: r.id, itemType: 'room', regularPrice: r.price }))];
    if (activeTab === 'dining') { const d = restaurants.length > 0 ? restaurants : [{ _id: 'ph1', name: 'Signature Restaurant', category: 'Fine Dining', rating: 4.9, regularPrice: 150, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }]; items = [...d.map(x => ({ ...x, itemType: 'restaurant' }))]; }
    if (activeTab === 'activities') { const a = activities.length > 0 ? activities : [{ _id: 'ph2', name: 'Scuba Diving', category: 'Water Sports', rating: 4.8, regularPrice: 250, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' }, { _id: 'ph3', name: 'Yacht Charter', category: 'Luxury', rating: 5.0, regularPrice: 1500, image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600' }]; items = [...a.map(x => ({ ...x, itemType: 'activity' }))]; }
    if (activeTab === 'rentals') items = [...Cars.map(c => ({ ...c, _id: c.id, itemType: 'rental', regularPrice: c.price, category: c.cat }))];
    if (activeTab === 'events') items = [...events.map(e => ({ ...e, itemType: 'event' }))];
    if (search) { const q = search.toLowerCase(); items = items.filter(i => i.name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)); }
    return items;
  };

  const renderItem = ({ item }: { item: any }) => {
    const labels: any = { room: '🏨 Room', restaurant: '🍽️ Dining', activity: '🏄 Activity', rental: '🚗 Rental', event: '🎉 Event' };
    return <TouchableOpacity style={s.listCard} activeOpacity={0.9} onPress={() => { if (item.itemType === 'rental') Alert.alert(item.name, `$${item.regularPrice}/day`); else if (item.itemType === 'event') Alert.alert(item.name, item.description || 'Coming soon'); else openRes(item, item.itemType); }}><Image source={{ uri: item.image }} style={s.listImg} /><View style={s.listContent}><Text style={s.listType}>{labels[item.itemType]}</Text><Text style={s.listName} numberOfLines={1}>{item.name}</Text><Text style={s.listCat} numberOfLines={1}>{item.category || item.type || item.venue || ' '}</Text><View style={s.listFooter}>{item.rating ? <Stars r={item.rating} sz={12} /> : null}{item.regularPrice ? <Price orig={item.regularPrice} disc={getPrice(item.regularPrice)} sz="sm" /> : null}</View></View><Ionicons name="chevron-forward" size={22} color={C.textMuted} /></TouchableOpacity>;
  };

  if (loading) return <View style={[s.loadingContainer, { paddingTop: insets.top }]}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><ActivityIndicator size="large" color={C.gold} /></View>;

  return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <View style={[s.exploreHeader, { paddingTop: insets.top + 10 }]}><View><Text style={s.exploreTitle}>Explore</Text><Text style={s.exploreSub}>Discover luxury experiences</Text></View><TouchableOpacity style={s.filterBtn} onPress={() => Alert.alert('Filters')}><Ionicons name="options-outline" size={24} color={C.gold} /></TouchableOpacity></View>
      <View style={s.searchBar}><Ionicons name="search" size={20} color={C.textMuted} /><TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />{search && search.length > 0 ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={C.textMuted} /></TouchableOpacity> : null}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>{tabs.map((t, i) => <TouchableOpacity key={t.id} style={[s.tabPill, activeTab === t.id && s.tabPillActive, i > 0 && { marginLeft: 10 }]} onPress={() => setActiveTab(t.id)}>{activeTab === t.id && <LinearGradient colors={G.gold} style={[StyleSheet.absoluteFill, { borderRadius: 25 }]} />}<Ionicons name={t.icon as any} size={18} color={activeTab === t.id ? C.bg : C.textSec} /><Text style={[s.tabPillText, activeTab === t.id && s.tabPillTextActive]}>{t.label}</Text></TouchableOpacity>)}</ScrollView>
      <FlatList data={getItems()} keyExtractor={(item) => `${item.itemType}-${item._id}`} renderItem={renderItem} contentContainerStyle={{ padding: 20, paddingBottom: 120 }} ListEmptyComponent={() => <View style={s.emptyState}><Ionicons name="search-outline" size={64} color={C.textMuted} /><Text style={s.emptyStateTitle}>No Results</Text></View>} />
      <ReservationModal visible={showRes} onClose={() => setShowRes(false)} item={selectedItem} type={resType} />
    </View>
  );
}

// INVEST SCREEN
function InvestScreen() {
  const insets = useSafeAreaInsets();
  const { user, isInvestor, getDiscountPercent, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const disc = getDiscountPercent();
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };
  
  // Visible tiers (Silver, Gold, Platinum, Diamond) - Black & Founders are hidden unless user has them
  const visibleTiers = [
    { id: 'silver', name: 'Silver', min: '$50K', discount: '5%', color: '#C0C0C0', benefits: ['Member Events', 'Quarterly Updates', 'Priority Support'] },
    { id: 'gold', name: 'Gold', min: '$100K', discount: '10%', color: '#FFD700', benefits: ['All Silver Benefits', 'VIP Reservations', 'Exclusive Dining'] },
    { id: 'platinum', name: 'Platinum', min: '$250K', discount: '20%', color: '#E5E4E2', benefits: ['All Gold Benefits', 'Helicopter Transfers', 'Yacht Access'] },
    { id: 'diamond', name: 'Diamond', min: '$500K', discount: '30%', color: '#B9F2FF', benefits: ['All Platinum Benefits', 'Private Jet', 'Dedicated Concierge'] },
  ];
  
  const openInvestorPage = () => {
    Linking.openURL('https://macauoftheamericas.com');
  };

  if (isInvestor && user) return (
    <View style={s.container}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.gold} />}><View style={s.invHeader}><Text style={s.invWelcome}>Welcome back,</Text><Text style={s.invName}>{user.name || 'Investor'}</Text></View><View style={{ paddingHorizontal: 20, marginBottom: 24 }}><GoldCard tier={user.investorTier || 'gold'} value={user.portfolioValue || 0} returns={12} disc={disc} name={user.name} onPress={() => Alert.alert('Card Details')} /></View><View style={s.invStats}>{[{ icon: 'wallet', label: 'Invested', value: `$${(user.investmentAmount || 0).toLocaleString()}`, color: C.gold }, { icon: 'trending-up', label: 'Returns', value: `+$${((user.portfolioValue || 0) - (user.investmentAmount || 0)).toLocaleString()}`, color: C.success }, { icon: 'pricetag', label: 'Discount', value: `${disc}%`, color: C.gold }].map((st, i) => <View key={i} style={s.invStatCard}><Ionicons name={st.icon as any} size={24} color={st.color} /><Text style={s.invStatValue}>{st.value}</Text><Text style={s.invStatLabel}>{st.label}</Text></View>)}</View><View style={s.invSection}><Text style={s.invSecTitle}>Quick Actions</Text><View style={s.invActions}>{[{ icon: 'document-text', label: 'Documents', color: C.gold }, { icon: 'headset', label: 'Concierge', color: C.blue }, { icon: 'gift', label: 'Benefits', color: C.purple }, { icon: 'add-circle', label: 'Invest More', color: C.success }].map((a, i) => <TouchableOpacity key={i} style={s.invAction} onPress={() => a.label === 'Invest More' ? openInvestorPage() : Alert.alert(a.label)}><View style={[s.invActionIcon, { backgroundColor: `${a.color}20` }]}><Ionicons name={a.icon as any} size={24} color={a.color} /></View><Text style={s.invActionLabel}>{a.label}</Text></TouchableOpacity>)}</View></View></ScrollView></View>
  );

  return (
    <View style={s.container}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}><View style={s.invHero}><MaterialCommunityIcons name="diamond-stone" size={64} color={C.gold} /><Text style={s.invHeroTitle}>Invest in Paradise</Text><Text style={s.invHeroSub}>Join the $2.5B Macau of the Americas project in Belize</Text></View><View style={s.invMetrics}>{[{ l: 'Project Value', v: '$2.5B' }, { l: 'Target ROI', v: '15-20%' }, { l: 'Opening', v: '2026' }].map((m, i) => <React.Fragment key={i}>{i > 0 ? <View style={s.invMetricDiv} /> : null}<View style={s.invMetric}><Text style={s.invMetricV}>{m.v}</Text><Text style={s.invMetricL}>{m.l}</Text></View></React.Fragment>)}</View><View style={s.invSection}><Text style={s.invSecTitle}>Investment Tiers</Text>{visibleTiers.map(tier => <LinearGradient key={tier.id} colors={G.card} style={s.tierCard}><View style={s.tierHeader}><View style={[s.tierBadge, { backgroundColor: tier.color }]}><Ionicons name="diamond" size={16} color={tier.id === 'silver' ? '#333' : '#fff'} /></View><View style={s.tierHeaderText}><Text style={s.tierName}>{tier.name}</Text><Text style={s.tierMin}>{tier.min} minimum</Text></View><View style={s.tierDisc}><Text style={s.tierDiscV}>{tier.discount}</Text><Text style={s.tierDiscL}>OFF</Text></View></View><View style={s.tierBenefits}>{tier.benefits.map((b, i) => <View key={i} style={s.tierBenefit}><Ionicons name="checkmark-circle" size={16} color={C.success} /><Text style={s.tierBenefitText}>{b}</Text></View>)}</View></LinearGradient>)}</View><View style={s.invCtaSection}><GoldBtn title="Request Investor Deck" icon="open-outline" lg onPress={openInvestorPage} style={{ width: '100%' }} /><Text style={s.invCtaNote}>Opens macauoftheamericas.com</Text></View></ScrollView></View>
  );
}

// PROFILE SCREEN
function ProfileScreen({ onShowAuthModal }: { onShowAuthModal: () => void }) {
  const insets = useSafeAreaInsets();
  const { user, isInvestor, logout, getDiscountPercent, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const isLoggedIn = !!user;
  const disc = getDiscountPercent();
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  if (!isLoggedIn) return (
    <View style={s.container}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><ScrollView contentContainerStyle={[s.profileGuestContainer, { paddingTop: insets.top + 40 }]}><View style={s.profileGuestIcon}><LinearGradient colors={G.gold} style={s.profileGuestIconGrad}><MaterialCommunityIcons name="diamond-stone" size={48} color={C.bg} /></LinearGradient></View><Text style={s.profileGuestTitle}>Join MOTA</Text><Text style={s.profileGuestSub}>Create a FREE account to unlock exclusive features</Text><View style={s.profileGuestBenefits}>{[{ icon: 'calendar', text: 'Book restaurants & activities' }, { icon: 'heart', text: 'Save your favorites' }, { icon: 'ticket', text: 'RSVP to exclusive events' }, { icon: 'gift', text: 'Receive special offers' }].map((b, i) => <View key={i} style={s.profileGuestBenefit}><View style={s.profileGuestBenefitIcon}><Ionicons name={b.icon as any} size={20} color={C.gold} /></View><Text style={s.profileGuestBenefitText}>{b.text}</Text></View>)}</View><GoldBtn title="Create Free Account" icon="person-add" lg onPress={onShowAuthModal} style={{ width: '100%' }} /><TouchableOpacity onPress={onShowAuthModal} style={{ marginTop: 16 }}><Text style={s.profileGuestSignIn}>Already have an account? <Text style={{ color: C.gold }}>Sign In</Text></Text></TouchableOpacity></ScrollView></View>
  );

  return (
    <View style={s.container}><LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.gold} />}><View style={s.profileHeader}><LinearGradient colors={G.gold} style={s.profileAvatar}><Text style={s.profileAvatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text></LinearGradient><Text style={s.profileName}>{user?.name || 'User'}</Text><Text style={s.profileEmail}>{user?.email || ''}</Text><View style={s.profileBadge}>{isInvestor ? <LinearGradient colors={G.gold} style={s.profileBadgeGrad}><MaterialCommunityIcons name="diamond-stone" size={16} color={C.bg} /><Text style={s.profileBadgeText}>{(user?.investorTier || 'GOLD').toUpperCase()} INVESTOR</Text></LinearGradient> : <View style={[s.profileBadgeGrad, { backgroundColor: C.blue }]}><Ionicons name="star" size={16} color="#fff" /><Text style={[s.profileBadgeText, { color: '#fff' }]}>MEMBER</Text></View>}</View></View><View style={s.profileStats}>{[{ v: `${disc}%`, l: 'Discount' }, { v: '0', l: 'Bookings' }, { v: '0', l: 'Favorites' }].map((st, i) => <View key={i} style={s.profileStatCard}><Text style={s.profileStatV}>{st.v}</Text><Text style={s.profileStatL}>{st.l}</Text></View>)}</View>{isInvestor && user?.investorTier ? <View style={{ paddingHorizontal: 20, marginBottom: 24 }}><Text style={s.profileSecTitle}>Your Card</Text><GoldCard tier={user.investorTier} value={user.portfolioValue || 0} returns={12} disc={disc} name={user.name} onPress={() => Alert.alert('Card Details')} /></View> : null}{[{ title: 'Account', items: [{ icon: 'person-outline', label: 'Edit Profile' }, { icon: 'notifications-outline', label: 'Notifications', badge: '3' }, { icon: 'heart-outline', label: 'Favorites' }, { icon: 'time-outline', label: 'Booking History' }] }, { title: 'Support', items: [{ icon: 'help-circle-outline', label: 'Help Center' }, { icon: 'chatbubble-outline', label: 'Live Chat' }, { icon: 'call-outline', label: 'Contact Us' }] }].map((sec, si) => <View key={si} style={s.profileSection}><Text style={s.profileSecTitle}>{sec.title}</Text><LinearGradient colors={G.card} style={s.profileMenu}>{sec.items.map((item: any, ii) => <TouchableOpacity key={ii} style={[s.profileMenuItem, ii < sec.items.length - 1 && s.profileMenuItemBorder]} onPress={() => Alert.alert(item.label)}><View style={s.profileMenuItemIcon}><Ionicons name={item.icon} size={22} color={C.gold} /></View><Text style={s.profileMenuItemLabel}>{item.label}</Text><View style={s.profileMenuItemRight}>{item.badge ? <View style={s.profileMenuItemBadge}><Text style={s.profileMenuItemBadgeText}>{item.badge}</Text></View> : null}<Ionicons name="chevron-forward" size={20} color={C.textMuted} /></View></TouchableOpacity>)}</LinearGradient></View>)}<View style={s.profileSection}><TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: logout }])}><Ionicons name="log-out-outline" size={22} color={C.error} /><Text style={s.logoutBtnText}>Sign Out</Text></TouchableOpacity></View><Text style={s.profileVersion}>MOTA v2.0</Text></ScrollView></View>
  );
}

// MAIN APP
function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [exploreParams, setExploreParams] = useState<any>({});
  const insets = useSafeAreaInsets();

  const handleNavigate = (tab: string, params?: any) => { if (params) setExploreParams(params); setActiveTab(tab); };

  const renderContent = () => {
    switch (activeTab) {
      case 'explore': return <ExploreScreen onShowAuth={() => setShowAuthModal(true)} initialTab={exploreParams?.tab} />;
      case 'invest': return <InvestScreen />;
      case 'profile': return <ProfileScreen onShowAuthModal={() => setShowAuthModal(true)} />;
      default: return <HomeScreen onShowAuth={() => setShowAuthModal(true)} onNavigate={handleNavigate} />;
    }
  };

  const navItems = [{ id: 'home', icon: 'home', label: 'Home' }, { id: 'explore', icon: 'compass', label: 'Explore' }, { id: 'invest', icon: 'diamond', label: 'Invest' }, { id: 'profile', icon: 'person', label: 'Profile' }];

  return (
    <View style={s.container}>
      {renderContent()}
      <View style={[s.navBar, { paddingBottom: Math.max(insets.bottom, 12) }]}><LinearGradient colors={['rgba(10,18,42,0.95)', 'rgba(10,18,42,0.99)']} style={StyleSheet.absoluteFill} />{navItems.map(item => <TouchableOpacity key={item.id} style={s.navItem} onPress={() => { setExploreParams({}); setActiveTab(item.id); }} activeOpacity={0.7}>{activeTab === item.id ? <LinearGradient colors={G.gold} style={s.navItemActive}><Ionicons name={item.icon as any} size={22} color={C.bg} /></LinearGradient> : <Ionicons name={`${item.icon}-outline` as any} size={24} color={C.textMuted} />}<Text style={[s.navLabel, activeTab === item.id && s.navLabelActive]}>{item.label}</Text></TouchableOpacity>)}</View>
      <BottomSheet isVisible={showAuthModal} onClose={() => setShowAuthModal(false)}><AuthModal onClose={() => setShowAuthModal(false)} /></BottomSheet>
    </View>
  );
}

// STYLES
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLogo: { fontSize: 48, fontWeight: '800', color: C.gold, letterSpacing: 12, marginTop: 16 },
  loadingTag: { fontSize: 14, color: C.textSec, marginTop: 8, letterSpacing: 2 },
  dots: { position: 'absolute', bottom: 100, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  dotActive: { backgroundColor: C.gold, width: 24 },
  heroHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  heroGreet: { fontSize: 14, color: C.textSec },
  heroLogo: { fontSize: 42, fontWeight: '800', color: C.gold, letterSpacing: 10 },
  heroName: { fontSize: 24, fontWeight: '600', color: C.text, marginTop: 4 },
  heroActions: { flexDirection: 'row', alignItems: 'center' },
  heroIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  heroProfileBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  heroProfileGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  heroProfileInit: { fontSize: 18, fontWeight: '700', color: C.bg },
  heroProfileOut: { width: '100%', height: '100%', borderRadius: 24, borderWidth: 2, borderColor: C.gold, justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 80, left: 20, right: 20 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text },
  heroSubtitle: { fontSize: 14, color: C.gold, marginTop: 4, letterSpacing: 1 },
  heroStats: { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(16,28,64,0.85)', borderRadius: 16, padding: 16 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatV: { fontSize: 22, fontWeight: '800', color: C.gold },
  heroStatL: { fontSize: 11, color: C.textSec, marginTop: 4 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 12 },
  goldCardWrap: { borderRadius: 20, shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  goldCard: { width: '100%', aspectRatio: 1.6, borderRadius: 20, padding: 24, overflow: 'hidden' },
  goldCardShine: { position: 'absolute', top: -80, right: -80, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ rotate: '45deg' }] },
  goldCardContent: { flex: 1, justifyContent: 'space-between' },
  goldCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  goldCardLogo: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 5 },
  goldCardTier: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  goldCardChip: { width: 50, height: 38, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: 6, justifyContent: 'space-around' },
  goldCardChipLine: { height: 3, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 1 },
  goldCardStats: { flexDirection: 'row' },
  goldCardLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  goldCardValue: { fontSize: 18, fontWeight: '700', color: '#fff', marginRight: 30 },
  goldCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goldCardDisc: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  goldCardName: { fontSize: 10, marginTop: 4, letterSpacing: 0.5 },
  qrCode: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, padding: 4, justifyContent: 'space-between' },
  qrRow: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  qrCell: { width: 5, height: 5, backgroundColor: 'transparent' },
  goldBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  goldBtnLg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  goldBtnText: { fontSize: 15, fontWeight: '700', color: C.bg },
  goldBtnTextLg: { fontSize: 17 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starsText: { color: C.goldLight, fontWeight: '600', marginLeft: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceOld: { color: C.textMuted, textDecorationLine: 'line-through', marginRight: 8 },
  priceNew: { fontWeight: '700', color: C.success },
  priceReg: { fontWeight: '700', color: C.text },
  section: { marginBottom: 28 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 16 },
  secTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  secSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  secAction: { fontSize: 14, fontWeight: '600', color: C.gold },
  guestCta: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
  guestCtaContent: { flex: 1, marginLeft: 16 },
  guestCtaTitle: { fontSize: 18, fontWeight: '700', color: C.bg },
  guestCtaSub: { fontSize: 13, color: 'rgba(0,0,0,0.7)', marginTop: 2 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
  memberIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(66,153,225,0.15)', justifyContent: 'center', alignItems: 'center' },
  memberContent: { flex: 1, marginLeft: 16 },
  memberTitle: { fontSize: 14, fontWeight: '700', color: C.blue, letterSpacing: 1 },
  memberSub: { fontSize: 13, color: C.textSec, marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 24 },
  quickAction: { width: '25%', padding: 6 },
  quickActionCard: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 8, borderRadius: 20 },
  quickActionIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionLabel: { fontSize: 13, fontWeight: '600', color: C.text },
  quickActionSub: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  roomCard: { width: width * 0.72, marginRight: 16, borderRadius: 20, overflow: 'hidden' },
  roomImage: { width: '100%', height: 320 },
  roomOverlay: { flex: 1, padding: 18, justifyContent: 'space-between' },
  roomName: { fontSize: 20, fontWeight: '700', color: C.text, marginTop: 8 },
  roomDetails: { fontSize: 13, color: C.textSec, marginTop: 4 },
  roomAmenities: { flexDirection: 'row', marginTop: 10 },
  amenityTag: { backgroundColor: C.goldMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  amenityText: { fontSize: 11, color: C.gold, fontWeight: '500' },
  roomFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  perNight: { fontSize: 13, color: C.textSec, marginLeft: 4 },
  placeholderCard: { borderRadius: 20, overflow: 'hidden' },
  placeholderImg: { width: '100%', height: 150 },
  placeholderContent: { padding: 16 },
  placeholderTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  placeholderText: { fontSize: 13, color: C.textSec, marginTop: 4 },
  diningCard: { width: width * 0.65, marginRight: 14, borderRadius: 16, overflow: 'hidden' },
  diningImg: { width: '100%', height: 240 },
  diningOverlay: { flex: 1, padding: 16, justifyContent: 'flex-end' },
  diningName: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 8 },
  diningCat: { fontSize: 13, color: C.textSec, marginTop: 2 },
  diningFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  reserveBtn: { backgroundColor: C.goldMuted, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  reserveBtnText: { fontSize: 13, fontWeight: '600', color: C.gold },
  carCard: { width: width * 0.55, marginRight: 14 },
  carCardInner: { borderRadius: 20, overflow: 'hidden' },
  carImg: { width: '100%', height: 140 },
  carContent: { padding: 16 },
  carName: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 8 },
  carFooter: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  carPrice: { fontSize: 20, fontWeight: '700', color: C.gold },
  carPriceUnit: { fontSize: 13, color: C.textSec, marginLeft: 2 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  amenityGridCard: { width: '50%', padding: 4 },
  amenityGridImg: { width: '100%', height: 140 },
  amenityGridOverlay: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  amenityGridIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  amenityGridTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  amenityGridDesc: { fontSize: 11, color: C.textSec, marginTop: 2 },
  actCard: { width: width * 0.55, marginRight: 14, borderRadius: 16, overflow: 'hidden' },
  actImg: { width: '100%', height: 200 },
  actOverlay: { flex: 1, padding: 14, justifyContent: 'space-between' },
  actName: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 6 },
  actCat: { fontSize: 12, color: C.textSec, marginTop: 2 },
  actListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 12 },
  actListImg: { width: 70, height: 70, borderRadius: 12 },
  actListContent: { flex: 1, marginLeft: 14 },
  actListName: { fontSize: 16, fontWeight: '600', color: C.text },
  actListPrice: { fontSize: 14, color: C.gold, marginTop: 4 },
  eventCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  eventImg: { width: '100%', height: 130 },
  eventOverlay: { flex: 1, justifyContent: 'flex-end' },
  eventContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  eventDateBox: { backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', marginRight: 14 },
  eventDateDay: { fontSize: 22, fontWeight: '800', color: C.bg },
  eventDateMonth: { fontSize: 10, fontWeight: '700', color: C.bg },
  eventDetails: { flex: 1 },
  eventName: { fontSize: 16, fontWeight: '700', color: C.text },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventVenue: { fontSize: 12, color: C.textSec, marginLeft: 4 },
  vipBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(10,18,42,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  vipBadgeText: { fontSize: 11, fontWeight: '600', color: C.gold, marginLeft: 4 },
  eventPlaceholder: { padding: 40, borderRadius: 20, alignItems: 'center' },
  eventPlaceholderText: { fontSize: 14, color: C.textMuted, marginTop: 12 },
  eventCardH: { width: width * 0.7, borderRadius: 16, overflow: 'hidden' },
  eventImgH: { width: '100%', height: 160 },
  eventOverlayH: { flex: 1, justifyContent: 'flex-end' },
  eventContentH: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  eventDetailsH: { flex: 1, marginLeft: 12 },
  eventNameH: { fontSize: 15, fontWeight: '700', color: C.text },
  eventVenueH: { fontSize: 12, color: C.textSec, marginLeft: 4, flex: 1 },
  invCta: { padding: 24, borderRadius: 20, overflow: 'hidden' },
  invCtaGlow: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(212,175,55,0.4)' },
  invCtaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  invCtaIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  invCtaContent: { flex: 1 },
  invCtaTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  invCtaSub: { fontSize: 13, color: C.textSec, marginTop: 4 },
  metricsTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  metricCard: { width: '50%', padding: 6 },
  metricValue: { fontSize: 24, fontWeight: '800', color: C.gold, backgroundColor: C.card, paddingVertical: 20, paddingHorizontal: 16, borderRadius: 16, textAlign: 'center', overflow: 'hidden' },
  metricLabel: { fontSize: 12, color: C.textSec, textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  resModal: { height: height * 0.85, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  resHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  resTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  resSub: { fontSize: 14, color: C.gold, marginTop: 4 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center' },
  resContent: { flex: 1, padding: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 12, marginTop: 20 },
  dateRow: { flexDirection: 'row' },
  dateOpt: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  dateOptActive: {},
  dateOptText: { fontSize: 14, fontWeight: '600', color: C.textSec },
  dateOptTextActive: { color: C.bg },
  timeOpt: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.card, marginRight: 10, overflow: 'hidden' },
  timeOptActive: {},
  timeOptText: { fontSize: 14, fontWeight: '600', color: C.textSec },
  timeOptTextActive: { color: C.bg },
  guestSel: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingVertical: 8 },
  guestBtn: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  guestCount: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: '700', color: C.text },
  summaryCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  summaryLabel: { fontSize: 14, color: C.textSec },
  summaryValue: { fontSize: 14, fontWeight: '600', color: C.text },
  resFooter: { padding: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  exploreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16 },
  exploreTitle: { fontSize: 32, fontWeight: '800', color: C.text },
  exploreSub: { fontSize: 14, color: C.textSec, marginTop: 4 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: C.text },
  tabsScroll: { marginBottom: 16 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: C.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  tabPillActive: { borderColor: C.gold },
  tabPillText: { fontSize: 13, fontWeight: '600', color: C.textSec, marginLeft: 8 },
  tabPillTextActive: { color: C.bg },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listImg: { width: 100, height: 100 },
  listContent: { flex: 1, padding: 14 },
  listType: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 4 },
  listName: { fontSize: 16, fontWeight: '700', color: C.text },
  listCat: { fontSize: 13, color: C.textSec, marginTop: 2 },
  listFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginTop: 20 },
  invHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  invWelcome: { fontSize: 14, color: C.textSec },
  invName: { fontSize: 28, fontWeight: '700', color: C.text, marginTop: 4 },
  invStats: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  invStatCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  invStatValue: { fontSize: 18, fontWeight: '700', color: C.gold, marginTop: 8 },
  invStatLabel: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  invSection: { paddingHorizontal: 20, marginBottom: 24 },
  invSecTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  invActions: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  invAction: { width: '25%', padding: 6, alignItems: 'center' },
  invActionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  invActionLabel: { fontSize: 12, color: C.textSec, fontWeight: '500' },
  invHero: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  invHeroTitle: { fontSize: 32, fontWeight: '800', color: C.text, marginTop: 20, textAlign: 'center' },
  invHeroSub: { fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 24, marginTop: 12 },
  invMetrics: { flexDirection: 'row', backgroundColor: C.card, marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 32 },
  invMetric: { flex: 1, alignItems: 'center' },
  invMetricV: { fontSize: 24, fontWeight: '800', color: C.gold },
  invMetricL: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  invMetricDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 },
  tierCard: { padding: 20, marginBottom: 12, borderRadius: 20 },
  tierHeader: { flexDirection: 'row', alignItems: 'center' },
  tierBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tierHeaderText: { flex: 1, marginLeft: 14 },
  tierName: { fontSize: 16, fontWeight: '700', color: C.text },
  tierMin: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  tierDisc: { alignItems: 'center' },
  tierDiscV: { fontSize: 20, fontWeight: '800', color: C.gold },
  tierDiscL: { fontSize: 10, color: C.textMuted },
  tierBenefits: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  tierBenefit: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tierBenefitText: { fontSize: 13, color: C.textSec, marginLeft: 10 },
  invCtaSection: { paddingHorizontal: 20, alignItems: 'center', marginBottom: 32 },
  invCtaNote: { fontSize: 12, color: C.textMuted, marginTop: 12 },
  profileGuestContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingBottom: 100 },
  profileGuestIcon: { marginBottom: 24 },
  profileGuestIconGrad: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  profileGuestTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 12, textAlign: 'center' },
  profileGuestSub: { fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  profileGuestBenefits: { width: '100%', marginBottom: 32 },
  profileGuestBenefit: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileGuestBenefitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileGuestBenefitText: { fontSize: 15, color: C.text, fontWeight: '500' },
  profileGuestSignIn: { fontSize: 14, color: C.textSec },
  profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 30 },
  profileAvatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileAvatarText: { fontSize: 36, fontWeight: '700', color: C.bg },
  profileName: { fontSize: 24, fontWeight: '700', color: C.text },
  profileEmail: { fontSize: 14, color: C.textSec, marginTop: 4 },
  profileBadge: { marginTop: 16 },
  profileBadgeGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  profileBadgeText: { fontSize: 12, fontWeight: '700', color: C.bg, marginLeft: 6, letterSpacing: 1 },
  profileStats: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  profileStatCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  profileStatV: { fontSize: 24, fontWeight: '700', color: C.gold },
  profileStatL: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  profileSection: { paddingHorizontal: 20, marginBottom: 24 },
  profileSecTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  profileMenu: { borderRadius: 20, overflow: 'hidden' },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  profileMenuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  profileMenuItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center' },
  profileMenuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: C.text, marginLeft: 14 },
  profileMenuItemRight: { flexDirection: 'row', alignItems: 'center' },
  profileMenuItemBadge: { backgroundColor: C.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  profileMenuItemBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoutBtnText: { fontSize: 15, fontWeight: '600', color: C.error, marginLeft: 8 },
  profileVersion: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 24 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  navItem: { flex: 1, alignItems: 'center' },
  navItemActive: { width: 44, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: '500' },
  navLabelActive: { color: C.gold, fontWeight: '600' },
});

export default function App() {
  return <SafeAreaProvider><AuthProvider><MainApp /></AuthProvider></SafeAreaProvider>;
}
