import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

// This is the component that will handle the redirect logic
const InitialLayout = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect will run whenever the 'user' or 'loading' state changes
  useEffect(() => {
    // Wait until the auth state is fully loaded
    if (loading) {
      return;
    }

    // If the user is logged in, redirect them to the home screen.
    if (user) {
      router.replace('/home');
    } 
    // If there is no user, they should be on the login screen.
    

  }, [user, loading]); // The dependency array for the effect

  // This Stack manages all the pages. The useEffect above will navigate between them.
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="journal" options={{ title: 'Journal', headerBackTitle: 'Back', headerTintColor: '#388E3C' }} />
      <Stack.Screen name="breathing" options={{ title: 'Breathing Exercise' }} />
      <Stack.Screen name="dulceFlowPuzzle" options={{ title: 'DulceFlow Puzzle', headerTintColor: '#388E3C' }} />
      <Stack.Screen name="videoDiary" options={{ title: 'Video Diary', headerShown: false }} />
    </Stack>
  );
};

// This is the main export. It wraps our entire app in the necessary providers.
export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <InitialLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}