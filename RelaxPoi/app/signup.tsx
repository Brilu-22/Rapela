import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router';

// Assuming COLORS are defined elsewhere and imported
const COLORS = { primary: '#E8F5E9', secondary: '#A5D6A7', text: '#388E3C', background: '#FFFFFF' };

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

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
      // Your signUp function in AuthContext will need to be updated
      await signUp(email, password, username);
      router.replace('/home'); // Navigate to home screen on successful sign-up
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {/* --- FIX APPLIED: Added placeholderTextColor to each TextInput --- */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={COLORS.secondary} // This makes the placeholder visible
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.secondary} // This makes the placeholder visible
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.secondary} // This makes the placeholder visible
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={COLORS.secondary} // This makes the placeholder visible
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.text} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      <Link href="/login" asChild>
        <TouchableOpacity>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

// Add your styles here...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
    input: { width: '90%', height: 50, backgroundColor: COLORS.primary, borderRadius: 15, paddingHorizontal: 20, fontSize: 16, color: COLORS.text, marginBottom: 10, borderWidth: 1, borderColor: COLORS.secondary },
    button: { width: '90%', backgroundColor: COLORS.secondary, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    buttonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
    linkText: { marginTop: 20, color: COLORS.text, textDecorationLine: 'underline', fontSize: 16 }
});

export default SignUpScreen;