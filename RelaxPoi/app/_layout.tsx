import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

// NOTE: We no longer import or use 'expo-splash-screen' in this file.
// The new animated splash screen at 'app/index.tsx' handles its own logic.

/**
 * This is the inner component that handles all navigation logic.
 * It's wrapped by AuthProvider, so it can safely call useAuth().
 */
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect now has one primary job: to redirect an already logged-in user.
    // The animated splash screen handles the initial navigation to the login screen for new users.

    // Do nothing while the auth state is being determined.
    if (loading) {
      return;
    }

    // If the app has finished loading the auth state AND a user exists,
    // it means they were already logged in. We should send them to the main app screen.
    if (user) {
      router.replace('/'); // Redirect to the animated splash screen
    }
    
    // If there is no user, we don't need to do anything here. The user will be
    // on the login/signup screens as intended.

  }, [user, loading]); // This effect runs whenever the user or loading state changes

  /**
   * This Stack is the "table of contents" for your app.
   * Every screen file in the 'app' directory must be listed here as a Stack.Screen.
   */
  return (
      <Stack>
        {/* The entry point, which renders our animated splash screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Authentication screens */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        
        {/* Main app screens */}
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="journal" options={{ title: 'Journal', headerBackTitle: 'Back', headerTintColor: '#388E3C' }} />
        <Stack.Screen name="breathing" options={{ title: 'Breathing Exercise' }} />
        <Stack.Screen name="videoDiary" options={{ title: 'Video Diary', headerShown: false }} />
        <Stack.Screen name="stats" options={{ title: 'Your Stats', headerBackTitle: 'Back', headerTintColor: '#388E3C' }} />

        {/* Game screens */}
        <Stack.Screen name="zenSlide" options={{ headerShown: false }} />
        <Stack.Screen name="mindfulGrowth" options={{ headerShown: false }} />
        <Stack.Screen name="willowispMaze" options={{ headerShown: false }} />
        <Stack.Screen name="starlightTap" options={{ headerShown: false }} />
        
        {/* Note: The file 'app/game.tsx' was replaced by 'app/zenSlide.tsx'. If you still have 'game.tsx', you should add it here or delete the file. */}
        {/* <Stack.Screen name="game" options={{ headerShown: false }} /> */}
      </Stack>
  );
}

/**
 * This is the main exported component for the layout.
 * Its ONLY job is to wrap the entire application in the necessary providers.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* The inner component is now a child of AuthProvider, which prevents the crash. */}
        <RootLayoutNav />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}