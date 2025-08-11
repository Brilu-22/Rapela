import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'; // Import Alert
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
  inactive: '#F1F8E9',
};

const HomeScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i - 2);
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: i === 2,
    };
  });

  const displayName = user?.isAnonymous ? 'there' : (user?.email?.split('@')[0] || 'Tony');

  // --- NEW LOGOUT HANDLER ---
  // This function will handle both logging out and redirecting the user.
  const handleLogout = async () => {
    try {
      await logout(); // Call the original logout function from your context
      // After logout is successful, replace the current screen with the login screen.
      // We use 'replace' to prevent the user from going back to the home screen.
      // Assuming your login screen is the root route '/'. If it's different, change it here.
      router.replace('/'); 
    } catch (error: any) {
      console.error("Logout Error:", error.message);
      Alert.alert("Logout Failed", "An error occurred while trying to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={styles.logo}><Text style={{ color: COLORS.text }}>D</Text></View>
            {/* The logout button now calls our new handleLogout function */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Feather name="log-out" size={26} color={COLORS.text} />
            </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <View style={styles.progressCircle}><Text style={styles.progressText}>75%</Text></View>
          <View>
            <TouchableOpacity onPress={() => router.push('./profile')}>
              <Text style={styles.welcomeMessage}>Enjoy your day, {displayName}</Text>
            </TouchableOpacity>
            <Text style={styles.planTitle}>Today's Plan</Text>
          </View>
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