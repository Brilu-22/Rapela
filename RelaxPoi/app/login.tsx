// app/(auth)/login.tsx

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

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAnonymously } = useAuth();
  const router = useRouter();

  // --- YOUR ORIGINAL LOGIN LOGIC (UNCHANGED) ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/home'); // Or '/(app)/home' if using groups
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- YOUR ORIGINAL ANONYMOUS LOGIN LOGIC (UNCHANGED) ---
  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
        await loginAnonymously();
        router.replace('/home'); // Or '/(app)/home' if using groups
    } catch (error: any) {
        Alert.alert("Authentication Error", error.message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
            <Feather name="feather" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your journey.</Text>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAnonymousLogin}>
              <Text style={styles.linkText}>Continue Anonymously</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <Link href="/signup" asChild>
        <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

// STYLES (UNCHANGED)
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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

export default LoginScreen;