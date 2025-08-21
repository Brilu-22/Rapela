// app/(app)/breathing.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
  withSequence,
  withRepeat,
  cancelAnimation,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
// ---> ADD GESTURE IMPORTS <---
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  white: '#FFFFFF',
};

const BreathingScreen = () => {
  useActivityTracker('breathing');
  const router = useRouter();

  const progress = useSharedValue(0);
  const [breathState, setBreathState] = useState<'idle' | 'inhaling' | 'holding' | 'exhaling'>('idle');

  // --- Functions to control the cycle ---
  const startBreathingCycle = () => {
    // Only start if it's currently idle
    if (breathState !== 'idle') return;

    setBreathState('inhaling');
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 7000, easing: Easing.out(Easing.ease) }, () => runOnJS(setBreathState)('holding')),
        withTiming(1, { duration: 4000 }, () => runOnJS(setBreathState)('exhaling')),
        withTiming(0, { duration: 8000, easing: Easing.out(Easing.ease) }, () => runOnJS(setBreathState)('inhaling'))
      ), -1, false
    );
  };

  const stopBreathingCycle = () => {
    cancelAnimation(progress);
    progress.value = withSpring(0);
    setBreathState('idle');
  };

  // Clean up the animation when the user leaves the screen
  useEffect(() => {
    return () => cancelAnimation(progress);
  }, []);


  // ---> NEW: GESTURE HANDLER FOR SWIPES <---
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      // Check for a vertical swipe
      if (Math.abs(event.translationY) > Math.abs(event.translationX) && Math.abs(event.translationY) > 50) {
        if (event.translationY < 0) {
          // A significant swipe UP
          runOnJS(startBreathingCycle)();
        } else {
          // A significant swipe DOWN
          runOnJS(stopBreathingCycle)();
        }
      }
    });

  // Animated style for the main circle (unchanged)
  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = 1 + progress.value * 0.5;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.accent, COLORS.primary]
    );
    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  // Determine the instruction text based on the current state (unchanged)
  const instructionText = {
    idle: 'You Ready?',
    inhaling: 'Breathe In...',
    holding: 'Hold',
    exhaling: 'Breathe Out...',
  }[breathState];

  return (
    // ---> WRAP THE ENTIRE SCREEN IN GestureHandlerRootView and GestureDetector <---
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="x" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Guided Breathing</Text>
          
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.circle, animatedCircleStyle]}>
              <Text style={styles.instructionText}>{instructionText}</Text>
            </Animated.View>
          </View>
          
          {/* We now show a subtle text hint instead of a large button */}
          <View style={styles.hintContainer}>
            <Feather name={breathState === 'idle' ? 'arrow-up' : 'arrow-down'} size={24} color={COLORS.textSecondary} />
            <Text style={styles.hintText}>
              {breathState === 'idle' ? 'Swipe Up to Start' : 'Swipe Down to Stop'}
            </Text>
          </View>

        </SafeAreaView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 20,
    zIndex: 10, // Ensure it's tappable
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    position: 'absolute',
    top: 100,
  },
  circleContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 150,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // New styles for the subtle hint text at the bottom
  hintContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    opacity: 0.8,
  },
  hintText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default BreathingScreen;