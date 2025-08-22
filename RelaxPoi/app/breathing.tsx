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
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const COLORS = {
  background: '#FFFFFF',      
  card: '#8BA889',          
  textLight: '#FFFFFF',      
  textDark: '#000000',       
  iconBorder: '#253528',     
  textPrimary: '#253528',     
  textSecondary: '#49654E',   
  accent: '#E8F5E9',         
};

const BreathingScreen = () => {
  useActivityTracker('breathing');
  const router = useRouter();

  const progress = useSharedValue(0);
  const [breathState, setBreathState] = useState<'idle' | 'inhaling' | 'holding' | 'exhaling'>('idle');

  
  const startBreathingCycle = () => {
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

  useEffect(() => {
    return () => cancelAnimation(progress);
  }, []);

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (Math.abs(event.translationY) > Math.abs(event.translationX) && Math.abs(event.translationY) > 50) {
        if (event.translationY < 0) {
          runOnJS(startBreathingCycle)();
        } else {
          runOnJS(stopBreathingCycle)();
        }
      }
    });

  
  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = 1 + progress.value * 0.5;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.accent, COLORS.card] 
    );
    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  const instructionText = {
    idle: 'You Ready?',
    inhaling: 'Breathe In...',
    holding: 'Hold',
    exhaling: 'Breathe Out...',
  }[breathState];

  const instructionTextColor = useAnimatedStyle(() => {
      // Animate text color for better readability
      return {
        color: interpolateColor(
            progress.value,
            [0, 0.5],
            [COLORS.textPrimary, COLORS.textLight]
        )
      }
  });


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.circleContainer}>
            <Animated.View style={[styles.circle, animatedCircleStyle]}>
              <Animated.Text style={[styles.instructionText, instructionTextColor]}>{instructionText}</Animated.Text>
            </Animated.View>
          </View>
          
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
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0', 
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
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.iconBorder,
  },
  instructionText: {
    fontSize: 32,
    fontWeight: '600',
  },
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