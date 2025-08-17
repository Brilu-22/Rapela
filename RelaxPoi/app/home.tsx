import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore'; // Import Firestore listener
import { db } from '../firebaseConfig';

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
  inactive: '#F1F8E9',
};

// Helper to get today's date string
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HomeScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [progress, setProgress] = useState(0); // State to hold the progress percentage

  const today = new Date();
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i - 2);
    return { day: days[date.getDay()], date: date.getDate(), isToday: i === 2 };
  });

  // This useEffect hook listens for changes to today's activities in Firestore
  useEffect(() => {
    if (!user) return; // Don't run if there's no user

    const todayString = getTodayDateString();
    const activityDocRef = doc(db, 'users', user.uid, 'dailyActivities', todayString);

    // onSnapshot creates a real-time listener
    const unsubscribe = onSnapshot(activityDocRef, (doc) => {
      const TOTAL_TASKS = 3; // Total tasks: Journal, Video Diary, Game
      let completedTasks = 0;

      if (doc.exists()) {
        const data = doc.data();
        if (data.journalCompleted) completedTasks++;
        if (data.videoDiaryCompleted) completedTasks++; // For future implementation
        if (data.gameCompleted) completedTasks++; // For future implementation
      }
      
      // Calculate and set the progress percentage
      const newProgress = (completedTasks / TOTAL_TASKS) * 100;
      setProgress(Math.round(newProgress));
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user]); // Rerun the effect if the user changes

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={styles.logo}><Text style={{ color: COLORS.text }}>D</Text></View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Feather name="log-out" size={26} color={COLORS.text} />
            </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          {/* PROGRESS CIRCLE NOW DISPLAYS DYNAMIC DATA */}
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => router.push('./profile')}>
              <Text style={styles.welcomeMessage}>Enjoy your day, {displayName}</Text>
            </TouchableOpacity>
            <Text style={styles.planTitle}>Today's Plan</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.largeCard} onPress={() => router.push('./stats')}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Feather name="bar-chart-2" size={24} color={COLORS.text} style={{ marginRight: 10 }}/>
                <Text style={styles.cardTitle}>View Your Mood Stats</Text>
            </View>
        </TouchableOpacity>

        <View style={styles.calendarContainer}>
          {/* ... existing calendar code ... */}
        </View>

        <View style={styles.calendarContainer}>
          {dates.map((d, index) => (
            <View key={index} style={[styles.dateBox, d.isToday && styles.todayBox]}>
              <Text style={[styles.dateText, d.isToday && styles.todayText]}>{d.date}</Text>

              <Text style={[styles.dayText, d.isToday && styles.todayText]}>{d.day}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.largeCard} onPress={() => router.push('/breathing')}>
            <Text style={styles.cardTitle}>Breathing Exercise</Text>
            <Text style={styles.cardDuration}>2 min</Text>
        </TouchableOpacity>
        
        <View style={styles.cardRow}>
            <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/journal')}>
                <Text style={styles.cardTitleSmall}>Journaling</Text>
                <Text style={styles.cardDurationSmall}>2 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallCard} onPress={() => router.push('/videoDiary')}>
                <Text style={styles.cardTitleSmall}>Video Diary</Text>
                <Text style={styles.cardDurationSmall}>2 min</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.largeCard} onPress={() => router.push('/game')}>
            <Text style={styles.cardTitle}>DulceFlow Puzzle</Text>
            <Text style={styles.cardDuration}>Timed Challenge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingHorizontal: 20 },
  header: { paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  logoutButton: { padding: 5 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  progressCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: COLORS.secondary, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  progressText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  welcomeMessage: { fontSize: 18, color: COLORS.text, textTransform: 'capitalize' },
  planTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  calendarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  dateBox: { width: 60, height: 80, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  todayBox: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  dateText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  dayText: { fontSize: 14, color: COLORS.text, opacity: 0.7 },
  todayText: { color: COLORS.background },
  largeCard: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center', marginBottom: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallCard: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: 30, width: '48%', alignItems: 'center' },
  cardTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  cardDuration: { fontSize: 16, color: COLORS.text, opacity: 0.7 },
  cardTitleSmall: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  cardDurationSmall: { fontSize: 14, color: COLORS.text, opacity: 0.7 },
});

export default HomeScreen;