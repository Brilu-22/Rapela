import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
};

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: [{ data: number[] }];
}

interface MoodEntry {
  rating: number;
  date: string;
}

const StatsScreen = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState<ChartData | null>(null);
  const [threeDayData, setThreeDayData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in to view stats.");
        return;
      }

      try {
        const moodQuery = query(
          collection(db, "moodEntries"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(moodQuery);
        
        // --- ADDED SAFETY CHECKS ---
        const fetchedEntries: MoodEntry[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Only process entries that have a valid rating and timestamp
            if (data && typeof data.rating === 'number' && data.createdAt instanceof Timestamp) {
                fetchedEntries.push({
                    rating: data.rating,
                    date: data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                });
            }
        });

        if (fetchedEntries.length === 0) {
            setLoading(false);
            return;
        }
        
        // --- Process data for the Daily Mood Bar Chart ---
        const recentEntries = fetchedEntries.slice(-7);
        setDailyData({
          labels: recentEntries.map(entry => entry.date),
          datasets: [{ data: recentEntries.map(entry => entry.rating) }],
        });

        // --- Process data for the 3-Day Average Line Chart ---
        if (fetchedEntries.length > 0) {
          const threeDayLabels: string[] = [];
          const threeDayAverages: number[] = [];
          for (let i = 0; i < fetchedEntries.length; i += 3) {
            const chunk = fetchedEntries.slice(i, i + 3);
            if (chunk.length > 0) {
              const sum = chunk.reduce((acc, curr) => acc + curr.rating, 0);
              const average = sum / chunk.length;
              threeDayAverages.push(parseFloat(average.toFixed(2)));
              threeDayLabels.push(chunk[chunk.length - 1].date);
            }
          }
          if (threeDayAverages.length > 1) { // Only show line chart if there's a trend to see
             setThreeDayData({
                labels: threeDayLabels,
                datasets: [{ data: threeDayAverages }],
             });
          }
        }

      } catch (err) {
        console.error("Error fetching mood data:", err);
        setError("Could not load mood data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [user]);

  const chartConfig = {
    backgroundColor: COLORS.primary,
    backgroundGradientFrom: COLORS.primary,
    backgroundGradientTo: '#D6EFD8',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(56, 142, 60, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(56, 142, 60, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.secondary },
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={COLORS.text} /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.container}><Text style={styles.messageText}>{error}</Text></SafeAreaView>;
  }
  
  if (!dailyData) {
    return <SafeAreaView style={styles.container}><Text style={styles.messageText}>No mood data recorded yet. Complete a journal entry to start tracking.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Your Mood Analytics</Text>

        {dailyData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Recent Daily Mood (1=Low, 5=High)</Text>
            <BarChart
              data={dailyData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              style={styles.chartStyle}
            />
          </View>
        )}

        {threeDayData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>3-Day Mood Average Trend</Text>
            <LineChart
              data={threeDayData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  chartContainer: { marginBottom: 32, alignItems: 'center' },
  chartTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  chartStyle: { borderRadius: 16 },
  messageText: { fontSize: 16, color: COLORS.text, textAlign: 'center', paddingHorizontal: 20 }
});

export default StatsScreen;