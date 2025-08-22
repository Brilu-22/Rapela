import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { DiaryEntryCard } from '../components/DiaryEntryCard';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';


const COLORS = {
  background: '#F0F2F5',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

type DiaryEntry = {
  id: string;
  downloadURL: string;
  createdAt: Timestamp;
};

const DiaryLogScreen = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const router = useRouter();

  
  useEffect(() => {
    if (!user) return;
    const entriesRef = collection(db, "users", user.uid, "videoDiaries");
    const q = query(entriesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const diaryEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DiaryEntry[]; 
      setEntries(diaryEntries);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Memories</Text>
        <View style={{ width: 48 }} />
      </View>
      <FlatList
        data={entries}
        renderItem={({ item }) => <DiaryEntryCard entry={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="film" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No diary entries yet.</Text>
            <Text style={styles.emptySubText}>Record a video diary to start your collection.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

// --- NEW STYLES ---
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
    color: COLORS.textPrimary 
  },
  listContent: { 
    paddingTop: 20, 
    paddingBottom: 20,
  },
  emptyContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 100,
    opacity: 0.8,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default DiaryLogScreen;