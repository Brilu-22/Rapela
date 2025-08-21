// app/(app)/home.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ActivityName } from '../hooks/useActivityTracker';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
};

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  screen: Href;
};

// ---> THIS IS THE FIX: Add the two missing games to the activities array <---
const activities: Activity[] = [
  { id: 'breathing', title: 'Breathing', subtitle: 'Guided Exercise', icon: 'wind', screen: '/breathing' },
  { id: 'journal', title: 'Journaling', subtitle: 'Reflect on your day', icon: 'edit-3', screen: '/journal' },
  { id: 'videoDiary', title: 'Video Diary', subtitle: 'Express yourself', icon: 'video', screen: '/videoDiary' },
  { id: 'zenslide', title: 'Zen Slide', subtitle: 'Mindful Puzzle', icon: 'grid', screen: '/zenslide' },
  { id: 'starlightTap', title: 'Starlight Tap', subtitle: 'Find constellations', icon: 'star', screen: '/starlightTap' },
  { id: 'willowispMaze', title: 'Wisp Maze', subtitle: 'A calming labyrinth', icon: 'git-branch', screen: '/willowispMaze' },
];

type ProgressRingProps = {
  value: number;
  label: string;
};

const ProgressRing = ({ value, label }: ProgressRingProps) => (
    <View style={styles.ringContainer}>
        <View style={styles.progressRing}>
            <Text style={styles.progressRingValue}>{value}{label.includes('%') ? '%' : ''}</Text>
        </View>
        <Text style={styles.progressRingLabel}>{label.replace('%', '').trim()}</Text>
    </View>
);

const HomeScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const scrollX = useSharedValue(0);

  // --- YOUR ORIGINAL DATA FETCHING LOGIC IS PRESERVED ---
  useEffect(() => {
    if (!user) return;
    const todayString = new Date().toISOString().split('T')[0];
    const activityDocRef = doc(db, 'users', user.uid, 'dailyActivities', todayString);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubActivities = onSnapshot(activityDocRef, (doc) => {
      const GOAL_SECONDS = 300;
      let totalSecondsToday = 0;
      if (doc.exists()) {
        const data = doc.data();
        // Make sure to include your new games here if you track their time
        const activities: ActivityName[] = ['journal', 'breathing', 'zenslide', 'videoDiary', 'starlightTap', 'willowispMaze'];
        activities.forEach(activity => {
            if (data[activity]) totalSecondsToday += data[activity];
        });
      }
      setProgress(Math.min(100, Math.round((totalSecondsToday / GOAL_SECONDS) * 100)));
    });

    const unsubUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) setStreak(doc.data().streak || 0);
    });

    return () => {
      unsubActivities();
      unsubUser();
    };
  }, [user]);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const displayName = user?.displayName || 'there';

  // --- YOUR ORIGINAL LOGOUT LOGIC IS PRESERVED ---
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error: any) {
      console.error("Logout Error:", error.message);
      Alert.alert("Logout Failed", "An error occurred while trying to log out.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <View>
                <Text style={styles.headerWelcome}>Welcome back,</Text>
                <Text style={styles.headerName}>{displayName}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Feather name="log-out" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </View>

        <View style={styles.card}>
            <View style={styles.progressContainer}>
                <ProgressRing value={progress} label="Daily Goal %" />
                <View style={styles.divider} />
                <ProgressRing value={streak} label="Day Streak" />
            </View>
        </View>

        <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Today's Focus</Text>
        </View>
        
        <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
        >
            {activities.map((item, index) => {
                const animatedStyle = useAnimatedStyle(() => {
                    const inputRange = [ (index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH ];
                    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9]);
                    return { transform: [{ scale }] };
                });

                return (
                    <Animated.View key={item.id} style={[styles.cardContainer, animatedStyle]}>
                        <TouchableOpacity style={styles.activityCard} onPress={() => router.push(item.screen)}>
                            <View style={styles.iconCircle}>
                                <Feather name={item.icon} size={30} color={COLORS.primary} />
                            </View>
                            <Text style={styles.activityTitle}>{item.title}</Text>
                            <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </Animated.ScrollView>

        <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/diaryLog')}>
                <Feather name="archive" size={22} color={COLORS.textSecondary} />
                <Text style={styles.listItemText}>My Memories</Text>
                <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/stats')}>
                <Feather name="bar-chart-2" size={22} color={COLORS.textSecondary} />
                <Text style={styles.listItemText}>Mood Stats</Text>
                <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingVertical: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerWelcome: { fontSize: 16, color: COLORS.textSecondary },
    headerName: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textTransform: 'capitalize' },
    logoutButton: { backgroundColor: COLORS.card, padding: 8, borderRadius: 20 },
    card: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, padding: 20, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    progressContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    ringContainer: { alignItems: 'center', flex: 1 },
    progressRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: COLORS.primary },
    progressRingValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    progressRingLabel: { marginTop: 10, fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    divider: { width: 1, height: '60%', backgroundColor: COLORS.background },
    calendarContainer: { paddingHorizontal: 20, marginVertical: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 15 },
    carouselContainer: { paddingHorizontal: ITEM_SPACING },
    cardContainer: { width: ITEM_WIDTH, paddingHorizontal: 10 },
    activityCard: { backgroundColor: COLORS.card, height: 280, borderRadius: 20, padding: 25, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    activityTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5 },
    activitySubtitle: { fontSize: 14, color: COLORS.textSecondary },
    listContainer: { marginHorizontal: 20, marginTop: 40 },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 20, borderRadius: 15, marginBottom: 10 },
    listItemText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
});

export default HomeScreen;