// app/diaryLog.tsx

import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Text, StyleSheet, View } from 'react-native';
// ---> FIX 1: Import the Timestamp type from Firestore <---
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { DiaryEntryCard } from '../components/DiaryEntryCard';

// ---> FIX 2: Define the "shape" of a single diary entry object <---
// This tells TypeScript what our data looks like.
type DiaryEntry = {
  id: string;
  downloadURL: string;
  createdAt: Timestamp; // A specific type for Firebase timestamps
};

const DiaryLogScreen = () => {
  const { user } = useAuth();
  // ---> FIX 3: Tell useState it will hold an array of DiaryEntry objects <---
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const entriesRef = collection(db, "users", user.uid, "videoDiaries");
    const q = query(entriesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const diaryEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      // We cast the result to our defined type to ensure type safety
      })) as DiaryEntry[]; 
      setEntries(diaryEntries);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={entries}
        renderItem={({ item }) => <DiaryEntryCard entry={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Text style={styles.title}>Your Memories</Text>}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text>No diary entries yet.</Text></View>}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  listContent: { paddingVertical: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#2D3748' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
});

export default DiaryLogScreen;