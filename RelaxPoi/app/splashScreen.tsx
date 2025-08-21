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

const COLORS = {
  background: '#000000ff',
  primary: '#68D391',
  secondary: '#F0FFF4',
};

const SplashScreen = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // --- Animation Shared Values ---
  const leafTranslateY = useSharedValue(-50);
  const leafOpacity = useSharedValue(0);
  const textTranslateY = [...'Dulce'].map(() => useSharedValue(20));
  const textOpacity = [...'Dulce'].map(() => useSharedValue(0));
  const containerOpacity = useSharedValue(1);

  // ---> ADD: New animated values for the slogan <---
  const sloganOpacity = useSharedValue(0);
  const sloganTranslateY = useSharedValue(10); // Start slightly below

  useEffect(() => {
    const navigateAfterAnimation = () => {
      const destination = user ? '/home' : '/login';
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

    // --- PART 1: ANIMATE IN ---
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

    // ---> ADD: Trigger the slogan animation after the main title <---
    // The main title finishes appearing around 2000ms. We'll start this at 2200ms.
    sloganOpacity.value = withDelay(2200, withTiming(1, { duration: 800 }));
    sloganTranslateY.value = withDelay(2200, withSpring(0, { damping: 15 }));


    // --- PART 2: DECIDE WHEN TO NAVIGATE ---
    const navigationDelay = 3500; // Slightly increased delay to let slogan appear

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

  // --- Animated Styles ---
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  
  const animatedLeafStyle = useAnimatedStyle(() => ({
    opacity: leafOpacity.value,
    transform: [{ translateY: leafTranslateY.value }],
  }));

  // ---> ADD: New animated style for the slogan <---
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
      
      {/* ---> ADD: The slogan component itself <--- */}
      <AnimatedView style={animatedSloganStyle}>
        <Text style={styles.slogan}>Keeping in perfect peace - Isaiah 26:3</Text>
      </AnimatedView>

    </AnimatedView>
  );
};

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
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  // ---> ADD: New style for the slogan text <---
  slogan: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.secondary,
    opacity: 0.8, // Slightly more subtle than the main title
    textAlign: 'center',
    paddingHorizontal: 20, // Add padding in case it wraps on small screens
  }
});

export default SplashScreen;