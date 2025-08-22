import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, 
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator, 
    TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useActivityTracker } from '../hooks/useActivityTracker';
import MoodModal from '../components/MoodModal'; 
import { Feather } from '@expo/vector-icons';
import { useUserData } from '../hooks/useUserData';


const COLORS = {
  background: '#F0F2F5',
  primary: '#4E6813',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
};

const JournalScreen = () => {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { updateUserProgress, saveMoodRating } = useUserData(); 
  const router = useRouter();
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  
  useActivityTracker('journal'); 

  
  const handleSave = async () => {
    if (!user) {
        Alert.alert("Login Required", "You must be logged in to save entries.");
        return;
    }
    if (entry.trim() === '') {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }

    setIsLoading(true);
    try {
      
      const entriesCollectionRef = collection(db, "users", user.uid, "entries");
      await addDoc(entriesCollectionRef, {
        content: entry,
        createdAt: serverTimestamp(),
      });
      
      await updateUserProgress(25); 
      
      
      setIsModalVisible(true);

    } catch (error) {
        console.error("Error saving entry:", error);
        Alert.alert("Error", "Could not save your entry. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  
  const handleSaveMood = async (rating: number) => {
    await saveMoodRating(rating); 
    Alert.alert("Thank You!", "Your mood has been logged.", [
        { text: 'OK', onPress: () => {
            setIsModalVisible(false);
            setEntry('');
            router.back();
        }}
    ]);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEntry('');
    router.back();
  };

  return (
    <>
      <MoodModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSaveMood={handleSaveMood}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
               
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                        <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>New Entry</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color={COLORS.primary} /> : <Feather name="check" size={28} color={COLORS.primary} />}
                    </TouchableOpacity>
                </View>

                
                <View style={styles.card}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder="What's on your mind?"
                        placeholderTextColor={COLORS.textSecondary}
                        value={entry}
                        onChangeText={setEntry}
                    />
                </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerButton: {
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 5, 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    padding: 20,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background, 
    borderRadius: 15,
  },
});

export default JournalScreen;