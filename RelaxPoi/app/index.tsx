import React from 'react';
import { View } from 'react-native';
import SplashScreen from './splashScreen'; // FIX: Changed to capital 'S' to match the filename

// The index route is the very first screen the app opens.
// We want it to be our animated splash screen.
export default function StartPage() {
  // Use a View with a background color as a fallback while the component loads
  return (
    <View style={{ flex: 1, backgroundColor: '#1A202C' }}>
      <SplashScreen />
    </View>
  );
}