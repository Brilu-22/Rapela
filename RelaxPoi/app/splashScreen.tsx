// app/SplashScreen.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const AnimatedView = Animated.createAnimatedComponent(View);

// --- "APPLE AESTHETIC / SOFT UI" PALETTE ---
const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

const SplashScreen = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // --- YOUR ORIGINAL ANIMATION VALUES (UNCHANGED) ---
  const leafTranslateY = useSharedValue(-50);
  const leafOpacity = useSharedValue(0);
  const textTranslateY = [...'Dulce'].map(() => useSharedValue(20));
  const textOpacity = [...'Dulce'].map(() => useSharedValue(0));
  const containerOpacity = useSharedValue(1);
  const sloganOpacity = useSharedValue(0);
  const sloganTranslateY = useSharedValue(10);

  // --- YOUR ORIGINAL LOGIC (UNCHANGED) ---
  useEffect(() => {
    const navigateAfterAnimation = () => {
      const destination = user ? '/home' : '/login'; // Or your group routes like '/(app)/home'
      containerOpacity.value = withDelay(
        500,
        withTiming(0, { 
          duration: 500,
          easing: Easing.in(Easing.ease),
        }, (finished) => {
          if (finished) {
            runOnJS(router.replace)(destination);
          }
        })
      );
    };

    leafOpacity.value = withTiming(1, { duration: 1000 });
    leafTranslateY.value = withSequence(
      withSpring(0, { damping: 12, stiffness: 90 }),
      withDelay(500, withSpring(10, { damping: 15, stiffness: 100 })),
      withSpring(0, { damping: 15, stiffness: 100 })
    );
    
    textOpacity.forEach((opacity, i) => {
      opacity.value = withDelay(800 + i * 150, withTiming(1, { duration: 600 }));
    });
    textTranslateY.forEach((translate, i) => {
      translate.value = withDelay(800 + i * 150, withSpring(0, { damping: 15 }));
    });

    sloganOpacity.value = withDelay(2200, withTiming(1, { duration: 800 }));
    sloganTranslateY.value = withDelay(2200, withSpring(0, { damping: 15 }));

    const navigationDelay = 3500;
    const timer = setTimeout(() => {
        if (!loading) {
            navigateAfterAnimation();
        }
    }, navigationDelay);

    if (!loading) {
        const immediateTimer = setTimeout(navigateAfterAnimation, navigationDelay);
        return () => clearTimeout(immediateTimer);
    }
    
    return () => clearTimeout(timer);

  }, [loading, user]);

  // --- ANIMATED STYLES (UPDATED WITH NEW COLORS) ---
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  
  const animatedLeafStyle = useAnimatedStyle(() => ({
    opacity: leafOpacity.value,
    transform: [{ translateY: leafTranslateY.value }],
  }));

  const animatedSloganStyle = useAnimatedStyle(() => {
    return {
      opacity: sloganOpacity.value,
      transform: [{ translateY: sloganTranslateY.value }],
    };
  });

  return (
    <AnimatedView style={[styles.container, animatedContainerStyle]}>
      <AnimatedView style={animatedLeafStyle}>
        <Feather name="feather" size={80} color={COLORS.primary} />
      </AnimatedView>

      <View style={styles.titleContainer}>
        {[...'Dulce'].map((letter, index) => {
          const animatedLetterStyle = useAnimatedStyle(() => ({
            opacity: textOpacity[index].value,
            transform: [{ translateY: textTranslateY[index].value }],
          }));
          return (
            <AnimatedView key={index} style={animatedLetterStyle}>
              <Text style={styles.title}>{letter}</Text>
            </AnimatedView>
          );
        })}
      </View>
      
      <AnimatedView style={animatedSloganStyle}>
        <Text style={styles.slogan}>Keeping in perfect peace - Isaiah 26:3</Text>
      </AnimatedView>

    </AnimatedView>
  );
};

// --- NEW STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  titleContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  title: {
    fontSize: 52,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  slogan: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});

export default SplashScreen;