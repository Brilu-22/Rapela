// In app/_layout.tsx
import { Directions, Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();

  // A simple horizontal swipe gesture to navigate
  // You would expand this for the specific vertical swipes on certain pages
  const flingGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      // Example: Navigate to journal on left swipe
      // This is a placeholder for a more robust navigation system
      router.push('/journal'); 
    });

  return (
    // GestureHandlerRootView is essential for gestures to work
    <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Stack navigator manages the pages */}
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="journal" options={{ title: 'Journal' }} />
            <Stack.Screen name="game" options={{ title: 'Game' }} />
        </Stack>
    </GestureHandlerRootView>
  );
}