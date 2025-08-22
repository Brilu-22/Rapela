import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { MusicProvider } from './MusicContext';

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="journal" options={{ title: 'Journal' }} />
      <Stack.Screen name="breathing" options={{ title: 'Breathing Exercise' }} />
      <Stack.Screen name="videoDiary" options={{ headerShown: false }} />
      <Stack.Screen name="diaryLog" options={{ title: 'Your Memories' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }}/>
      <Stack.Screen name="zenslide" options={{ headerShown: false }} />
      <Stack.Screen name="mindfulGrowth" options={{ headerShown: false }} />
      <Stack.Screen name="willowispMaze" options={{ headerShown: false }} />
      <Stack.Screen name="starlightTap" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ title: 'Your Stats' }} />
      <Stack.Screen name="musicControl" options={{ 
        title: 'Sound Settings',
        presentation: 'modal',
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MusicProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </MusicProvider>
    </AuthProvider>
  );
}