import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
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
  const router = useRouter();
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
          collection(db, "users", user.uid, "moods"),
          orderBy("date", "asc") 
        );
        const querySnapshot = await getDocs(moodQuery);
        
        const fetchedEntries: MoodEntry[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data && typeof data.rating === 'number' && data.date instanceof Timestamp) {
                fetchedEntries.push({
                    rating: data.rating,
                    
                    date: data.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                });
            }
        });

        if (fetchedEntries.length === 0) {
            setLoading(false);
            return;
        }
        
        const recentEntries = fetchedEntries.slice(-7);
        setDailyData({
          labels: recentEntries.map(entry => entry.date),
          datasets: [{ data: recentEntries.map(entry => entry.rating) }],
        });

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
          if (threeDayAverages.length > 1) {
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
    backgroundColor: COLORS.card,
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, 
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.primary },
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.container}><Text style={styles.messageText}>{error}</Text></SafeAreaView>;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Mood Analytics</Text>
        <View style={{width: 48}} />{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!dailyData ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.messageText}>No mood data recorded yet. Complete a journal entry to start tracking.</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Recent Daily Mood (1=Low, 5=High)</Text>
              <BarChart
                data={dailyData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                fromZero
                yAxisLabel=""
                yAxisSuffix=""
                style={styles.chartStyle}
                showBarTops={false}
              />
            </View>

            {threeDayData && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>3-Day Mood Average Trend</Text>
                <LineChart
                  data={threeDayData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerButton: {
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollContent: { 
    padding: 20, 
    alignItems: 'center' 
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.textPrimary, 
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  chartStyle: { 
    borderRadius: 16 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  messageText: { 
    fontSize: 16, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    paddingHorizontal: 20 
  }
});

export default StatsScreen;