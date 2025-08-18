import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as SplashScreen from 'expo-splash-screen'; 

// This command tells the splash screen to stay visible automatically.
// We will hide it manually when the app is ready.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  // Get the user and the loading status from your AuthContext
  const { user, loading } = useAuth();
  const router = useRouter();

  // This useEffect hook handles the navigation logic
  useEffect(() => {
    // Wait until the auth state is fully loaded and no longer in the 'loading' state
    if (loading) {
      return; // Do nothing while loading
    }

    // --- This is the key logic ---
    // Once loading is false, we can hide the splash screen and navigate.
    SplashScreen.hideAsync();

    if (user) {
      // If there is a user, navigate them to the main part of the app.
      router.replace('/home');
    } else {
      // If there is no user, navigate them to the login screen.
      // This ensures they can't access 'home' without being logged in.
      router.replace('/login');
    }

  }, [user, loading]); // Rerun this effect whenever user or loading status changes

  // While the useEffect is running and deciding where to go,
  // we render the navigation stack. The splash screen will cover this
  // until we call hideAsync().
  return (
    <Stack>
     
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      
      
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="journal" options={{ title: 'Journal', headerBackTitle: 'Back', headerTintColor: '#388E3C' }} />
      <Stack.Screen name="breathing" options={{ title: 'Breathing Exercise' }} />
      <Stack.Screen name="game" options={{ title: 'DulceFlow Puzzle', headerTintColor: '#388E3C' }} />
      <Stack.Screen name="videoDiary" options={{ title: 'Video Diary', headerShown: false }} />
      <Stack.Screen name="stats" options={{ title: 'Your Stats', headerBackTitle: 'Back', headerTintColor: '#388E3C' }} />
    </Stack>
  );
};

// This is the main export. It wraps the entire app in the necessary providers.
export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <InitialLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}