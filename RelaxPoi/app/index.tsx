import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Use the same color palette
const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
};

const LoginScreen = () => {
  const router = useRouter();

  const handleLogin = () => {
    // For now, just navigate to the home screen
    // Later, this will be where Firebase Auth is called
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dulce</Text>
      <Text style={styles.subtitle}>Your calm space</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Enter Anonymously</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: 40,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;