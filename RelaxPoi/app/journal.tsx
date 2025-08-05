// app/journal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router, useRouter } from 'expo-router';

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
};

const JournalScreen = () => {
  const [entry, setEntry] = useState('');

  const handleSave = () => {
    if (entry.trim() === '') {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }
    // For now, we just show a confirmation and clear the text.
    Alert.alert("Saved", "Your journal entry has been saved.", [{ text: "OK", onPress: () => setEntry('') }]);
  };

  const swipeBackGesture = Gesture.Fling()
    .direction(Directions.RIGHT) // Only trigger on a right swipe
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
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