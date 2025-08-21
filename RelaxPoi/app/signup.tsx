// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// --- "APPLE AESTHETIC / SOFT UI" PALETTE ---
const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  white: '#FFFFFF', // ---> THIS IS THE FIX <---
};

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  // --- YOUR ORIGINAL SIGN UP LOGIC (UNCHANGED) ---
  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Input Required", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, username);
      router.replace('/home'); // Or '/(app)/home' if using groups
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Start your journey to a calmer mind.</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor={COLORS.textSecondary} value={username} onChangeText={setUsername} />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={COLORS.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="check-circle" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={COLORS.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>

        {isLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} /> : (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView> 
  );
};

// --- STYLES (MATCHES LOGIN SCREEN) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.shadow,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 25,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;