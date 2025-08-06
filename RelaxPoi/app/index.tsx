import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

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
  const { login, signUp, loginAnonymously } = useAuth();

  const handleAction = async (action: 'login' | 'signup' | 'anonymous') => {
    if ((action === 'login' || action === 'signup') && (!email || !password)) {
        Alert.alert("Input Required", "Please enter both email and password.");
        return;
    }

    setIsLoading(true);
    try {
      if (action === 'login') await login(email, password);
      else if (action === 'signup') await signUp(email, password);
      else if (action === 'anonymous') await loginAnonymously();
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dulce</Text>
      <Text style={styles.subtitle}>Your calm space</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A5D6A7"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A5D6A7"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.text} style={{marginVertical: 20}} />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleAction('login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => handleAction('signup')}>
            <Text style={styles.buttonOutlineText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAction('anonymous')}>
            <Text style={styles.anonymousText}>Continue Anonymously</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 52,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: 40,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  button: {
    width: '90%',
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  buttonOutlineText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  anonymousText: {
    marginTop: 20,
    color: COLORS.text,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default LoginScreen;