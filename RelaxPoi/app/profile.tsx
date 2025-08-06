import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { ref, update } from 'firebase/database';
//import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (username.trim().length < 3) {
      Alert.alert("Invalid Name", "Username must be at least 3 characters long.");
      return;
    }
    
    setIsLoading(true);
    try {
      
      await updateProfile(user, { displayName: username });

      
      const updates: Record<string, any> = {};
      updates[`/games/global_room/players/${user.uid}/name`] = username;
    

      Alert.alert("Success", "Your username has been updated.", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your username"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#388E3C', marginBottom: 30 },
  input: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7'
  },
  button: {
    backgroundColor: '#A5D6A7',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default ProfileScreen;