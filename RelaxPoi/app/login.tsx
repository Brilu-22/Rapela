import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router'; // Import Link

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAnonymously } = useAuth(); // We only need login functions here
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/home'); // On success, go to home
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
        await loginAnonymously();
        router.replace('/home');
    } catch (error: any) {
        Alert.alert("Authentication Error", error.message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.text} style={{marginVertical: 20}} />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAnonymousLogin}>
            <Text style={styles.anonymousText}>Continue Anonymously</Text>
          </TouchableOpacity>
        </>
      )}
      
      {/* Link to the new Sign Up page */}
      <Link href="/signup" asChild>
        <TouchableOpacity>
            <Text style={styles.anonymousText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20, },
  title: { fontSize: 52, fontWeight: 'bold', color: COLORS.text, },
  subtitle: { fontSize: 18, color: COLORS.text, opacity: 0.8, marginBottom: 40, },
  input: { width: '90%', height: 50, backgroundColor: COLORS.primary, borderRadius: 15, paddingHorizontal: 20, fontSize: 16, color: COLORS.text, marginBottom: 10, borderWidth: 1, borderColor: COLORS.secondary, },
  button: { width: '90%', backgroundColor: COLORS.secondary, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, },
  buttonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold', },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.secondary, },
  buttonOutlineText: { color: COLORS.secondary, fontSize: 16, fontWeight: 'bold', },
  anonymousText: { marginTop: 20, color: COLORS.text, textDecorationLine: 'underline', fontSize: 16, },
});

export default LoginScreen;