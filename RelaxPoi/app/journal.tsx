import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useActivityTracker } from '../hooks/useActivityTracker'; 

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
};

// Helper function to get today's date as a string (e.g., "2025-08-17")
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const JournalScreen = () => {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Get the current user from context
  useActivityTracker('journal');

  const handleSave = async () => {
    if (entry.trim() === '') {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }
    if (!user) {
        Alert.alert("Not Logged In", "You need to be logged in to save an entry.");
        return;
    }

    setIsLoading(true);
    try {
      // 1. Save the main journal entry
      await addDoc(collection(db, "journalEntries"), {
        userId: user.uid,
        text: entry,
        createdAt: serverTimestamp(),
      });
      
      // 2. Update the daily progress tracker for today
      const todayString = getTodayDateString();
      // This creates a document path like: /users/USER_ID/dailyActivities/2025-08-17
      const activityDocRef = doc(db, 'users', user.uid, 'dailyActivities', todayString);
      // setDoc with { merge: true } adds or updates the field without overwriting the doc
      await setDoc(activityDocRef, { journalCompleted: true }, { merge: true });
      
      Alert.alert("Saved", "Your journal entry has been saved.", [{ text: "OK", onPress: () => router.back() }]);

    } catch (error) {
        console.error("Error saving entry:", error);
        Alert.alert("Error", "Could not save your entry. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const swipeBackGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      router.back();
    });

  return (
     <GestureDetector gesture={swipeBackGesture}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
        >
          <Text style={styles.prompt}>What's on your mind?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Start writing..."
            value={entry}
            onChangeText={setEntry}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator color={COLORS.background} />
            ) : (
                <Text style={styles.saveButtonText}>Save Entry</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardAvoidingContainer: { flex: 1, padding: 20 },
  prompt: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JournalScreen;