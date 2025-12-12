/**
 * SkeletonLoader - Animated loading placeholders
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#1A2A50',
};

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ 
  width: w = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonProps) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: w,
          height,
          borderRadius,
          backgroundColor: C.cardLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton layouts
export const CardSkeleton = () => (
  <View style={s.card}>
    <Skeleton height={160} borderRadius={16} />
    <View style={s.cardContent}>
      <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
      <Skeleton width="50%" height={14} style={{ marginBottom: 12 }} />
      <View style={s.cardFooter}>
        <Skeleton width={60} height={14} />
        <Skeleton width={40} height={14} />
      </View>
    </View>
  </View>
);

export const HeroSkeleton = () => (
  <View style={s.hero}>
    <Skeleton width={width} height={280} borderRadius={0} />
  </View>
);

export const ListItemSkeleton = () => (
  <View style={s.listItem}>
    <Skeleton width={60} height={60} borderRadius={12} />
    <View style={s.listItemContent}>
      <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={12} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={12} />
    </View>
  </View>
);

export const ProfileSkeleton = () => (
  <View style={s.profile}>
    <Skeleton width={100} height={100} borderRadius={50} />
    <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
    <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
  </View>
);

export const GridSkeleton = ({ count = 4 }: { count?: number }) => (
  <View style={s.grid}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={s.gridItem}>
        <Skeleton height={140} borderRadius={12} />
        <Skeleton width="80%" height={14} style={{ marginTop: 10 }} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
    ))}
  </View>
);

export const HomeSkeleton = () => (
  <View style={s.container}>
    <HeroSkeleton />
    <View style={s.section}>
      <Skeleton width={150} height={22} style={{ marginBottom: 16 }} />
      <View style={s.row}>
        <CardSkeleton />
        <CardSkeleton />
      </View>
    </View>
    <View style={s.section}>
      <Skeleton width={120} height={22} style={{ marginBottom: 16 }} />
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </View>
  </View>
);

export const DetailSkeleton = () => (
  <View style={s.container}>
    <Skeleton width="100%" height={300} borderRadius={0} />
    <View style={s.detailContent}>
      <Skeleton width="80%" height={28} style={{ marginBottom: 12 }} />
      <Skeleton width="50%" height={16} style={{ marginBottom: 24 }} />
      <View style={s.chips}>
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={100} height={32} borderRadius={16} />
        <Skeleton width={70} height={32} borderRadius={16} />
      </View>
      <Skeleton width="100%" height={100} style={{ marginTop: 24 }} />
      <Skeleton width="100%" height={80} style={{ marginTop: 16 }} />
    </View>
  </View>
);

export const NotificationSkeleton = () => (
  <View style={s.container}>
    {Array.from({ length: 5 }).map((_, i) => (
      <View key={i} style={s.notificationItem}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={s.notificationContent}>
          <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
          <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="30%" height={12} />
        </View>
      </View>
    ))}
  </View>
);

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  card: {
    width: (width - 48) / 2,
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hero: {
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: (width - 44) / 2,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  detailContent: {
    padding: 20,
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default {
  Skeleton,
  CardSkeleton,
  HeroSkeleton,
  ListItemSkeleton,
  ProfileSkeleton,
  GridSkeleton,
  HomeSkeleton,
  DetailSkeleton,
  NotificationSkeleton,
};
