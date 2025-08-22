import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ActivityName } from '../hooks/useActivityTracker';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useMusic } from './MusicContext'; 

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.6;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;


const COLORS = {
  background: '#FFFFFF',
  card: '#8BA889',
  textLight: '#FFFFFF',
  textDark: '#000000', 
  iconBorder: '#253528',
  textPrimary: '#253528',
  textSecondary: '#49654E',
};

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  screen: Href;
};

const activities: Activity[] = [
  { id: 'breathing', title: 'Breathing', subtitle: 'Guided Exercise', icon: 'wind', screen: '/breathing' },
  { id: 'journal', title: 'Journaling', subtitle: 'Reflect on your day', icon: 'edit-3', screen: '/journal' },
  { id: 'videoDiary', title: 'Video Diary', subtitle: 'Express yourself', icon: 'video', screen: '/videoDiary' },
  { id: 'zenslide', title: 'Zen Slide', subtitle: 'Mindful Puzzle', icon: 'grid', screen: '/zenslide' },
  { id: 'starlightTap', title: 'Starlight Tap', subtitle: 'Find constellations', icon: 'star', screen: '/starlightTap' },
  { id: 'willowispMaze', title: 'Wisp Maze', subtitle: 'A calming labyrinth', icon: 'git-branch', screen: '/willowispMaze' },
  { id: 'music', title: 'Sound Settings', subtitle: 'Control background music', icon: 'music', screen: '/musicControl' },
];


const HomeScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const scrollX = useSharedValue(0);
  const { isPlaying, togglePlayPause } = useMusic();

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
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.headerIcon}>
                <Feather name={isPlaying ? "volume-2" : "volume-x"} size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.headerIcon}>
                <Feather name="log-out" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
        </View>

        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{progress}%</Text>
                <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/musicControl')} style={styles.statItem}>
                <Feather name="music" size={28} color={COLORS.textLight} />
                <Text style={styles.statLabel}>Sound</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mindful Activities</Text>
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
                                <Feather name={item.icon} size={30} color={COLORS.iconBorder} />
                            </View>
                            <Text style={styles.activityTitle}>{item.title}</Text>
                            <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </Animated.ScrollView>

        <View style={styles.listContainer}>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/diaryLog')}>
                <Text style={styles.listItemText}>My Memories</Text>
                <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/stats')}>
                <Text style={styles.listItemText}>Mood Stats</Text>
                <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => router.push('/MusicControlScreen')}>
                <Text style={styles.listItemText}>Sound Settings</Text>
                <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingVertical: 10 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 10,
        marginBottom: 20,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        backgroundColor: '#E8F5E9', 
        padding: 10,
        borderRadius: 20,
        marginLeft: 10,
    },
    headerWelcome: { 
        fontSize: 16, 
        color: COLORS.textSecondary 
    },
    headerName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: COLORS.textPrimary, 
        textTransform: 'capitalize' 
    },
    statsCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        marginHorizontal: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    statLabel: {
        marginTop: 4,
        fontSize: 14,
        color: COLORS.textLight,
        opacity: 0.8,
    },
    sectionHeader: { 
        paddingHorizontal: 20, 
        marginTop: 40,
        marginBottom: 10,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: COLORS.textPrimary, 
    },
    carouselContainer: { 
        paddingHorizontal: ITEM_SPACING,
        paddingVertical: 20,
    },
    cardContainer: { 
        width: ITEM_WIDTH, 
        paddingHorizontal: 10 
    },
    activityCard: { 
        backgroundColor: COLORS.card, 
        height: 220, 
        borderRadius: 20, 
        padding: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    iconCircle: { 
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.iconBorder,
    },
    activityTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: COLORS.textDark,
        marginBottom: 5 
    },
    activitySubtitle: { 
        fontSize: 14, 
        color: COLORS.textSecondary 
    },
    listContainer: { 
        marginHorizontal: 20, 
        marginTop: 20 
    },
    listItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F3F4F6',
        paddingVertical: 18,
        paddingHorizontal: 20, 
        borderRadius: 15, 
        marginBottom: 10 
    },
    listItemText: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '600', 
        color: COLORS.textPrimary,
    },
});

export default HomeScreen;