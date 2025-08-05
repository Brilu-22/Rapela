import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Expo comes with vector icons

// Our calming green color palette
const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
  inactive: '#F1F8E9',
};

const HomeScreen = () => {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  const dates = [];

  // Generate dates for the calendar view
  for (let i = -2; i <= 2; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: i === 0,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            {/* You can replace this with an actual logo component/image */}
            <Text style={{ color: COLORS.text }}>DC</Text>
          </View>
        </View>

        {/* Welcome Message & Progress */}
        <View style={styles.welcomeSection}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>75%</Text>
          </View>
          <View>
            <Text style={styles.welcomeMessage}>Enjoy your day, Tony</Text>
            <Text style={styles.planTitle}>Today's Plan</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {dates.map((d, index) => (
            <View
              key={index}
              style={[
                styles.dateBox,
                { backgroundColor: d.isToday ? COLORS.secondary : COLORS.background },
              ]}
            >
              <Text style={[styles.dateText, { color: d.isToday ? COLORS.background : COLORS.text }]}>{d.date}</Text>
              <Text style={[styles.dayText, { color: d.isToday ? COLORS.background : COLORS.text, opacity: 0.7 }]}>{d.day}</Text>
            </View>
          ))}
        </View>

        {/* Activity Cards */}
        <TouchableOpacity style={styles.largeCard}>
            <Feather name="clock" size={24} color={COLORS.text} style={styles.icon} />
            <Text style={styles.cardTitle}>Memory Game</Text>
            <Text style={styles.cardDuration}>2 min</Text>
        </TouchableOpacity>

        <View style={styles.cardRow}>
            <TouchableOpacity style={styles.smallCard}>
                <Feather name="clock" size={20} color={COLORS.text} style={styles.icon} />
                <Text style={styles.cardTitleSmall}>Breathing Exercise</Text>
                <Text style={styles.cardDurationSmall}>2 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallCard}>
                <Feather name="clock" size={20} color={COLORS.text} style={styles.icon} />
                <Text style={styles.cardTitleSmall}>Journaling</Text>
                <Text style={styles.cardDurationSmall}>2 min</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.largeCard, { marginBottom: 40 }]}>
            <Feather name="clock" size={24} color={COLORS.text} style={styles.icon} />
            <Text style={styles.cardTitle}>Video Diary</Text>
            <Text style={styles.cardDuration}>2 min</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  welcomeMessage: {
    fontSize: 18,
    color: COLORS.text,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dateBox: {
    width: 60,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 14,
  },
  largeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  smallCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 20,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
      position: 'absolute',
      top: 20,
      left: 20,
      opacity: 0.5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  cardDuration: {
      fontSize: 16,
      color: COLORS.text,
      opacity: 0.7,
  },
  cardTitleSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDurationSmall: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.7,
  },
});

export default HomeScreen;