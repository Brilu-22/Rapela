// app/_layout.tsx

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

/**
 * This is the inner component that defines all the screens.
 * Because it's a child of the default export, we can be 100% sure that
 * AuthProvider is ready before any of these screens try to render.
 */
function RootLayoutNav() {
  return (
      <Stack>
        {/* The entry point is always index, which renders our splash screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Authentication screens */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        
        {/* Main app screens */}
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="journal" options={{ title: 'Journal' }} />
        <Stack.Screen name="breathing" options={{ title: 'Breathing Exercise' }} />
        <Stack.Screen name="videoDiary" options={{ headerShown: false }} />
        <Stack.Screen name="diaryLog" options={{ title: 'Your Memories' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }}/>

        {/* --- FIX FOR WARNING #2: Ensure these files exist --- */}
        {/* If you don't have these games yet, you can comment these lines out */}
        <Stack.Screen name="zenslide" options={{ headerShown: false }} />
        <Stack.Screen name="mindfulGrowth" options={{ headerShown: false }} />
        <Stack.Screen name="willowispMaze" options={{ headerShown: false }} />
        <Stack.Screen name="starlightTap" options={{ headerShown: false }} />
        
        {/* --- FIX FOR WARNING #3: Change 'zenSlide' to 'dulceFlowPuzzle' --- */}
        {/* I'm assuming 'zenslide' was a typo and you meant the puzzle game we built */}
        {/* <Stack.Screen name="dulceFlowPuzzle" options={{ headerShown: false }} /> */}

        {/* The stats screen from your previous code */}
        <Stack.Screen name="stats" options={{ title: 'Your Stats' }} />
      </Stack>
  );
}

/**
 * This is the main exported component. Its ONLY job is to provide context.
 */
export default function RootLayout() {
  return (
    // The provider is the parent
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* The navigator is the child, so it and all its screens can use the context */}
        <RootLayoutNav />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}