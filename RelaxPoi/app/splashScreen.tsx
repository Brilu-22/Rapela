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
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

// Create an animatable version of View for our animations
const AnimatedView = Animated.createAnimatedComponent(View);

// A refined, Apple-inspired monochromatic palette for the splash screen
const COLORS = {
  background: '#000000ff', // A very dark, serene blue-grey
  primary: '#68D391',   // The main, vibrant but soft green for the leaf
  secondary: '#F0FFF4', // A very light, almost white green for the text
};

const SplashScreen = () => {
  const router = useRouter();

  // --- Animation Shared Values ---
  // For the leaf
  const leafTranslateY = useSharedValue(-50); // Start leaf above the screen
  const leafOpacity = useSharedValue(0);

  // For the staggered text
  const textTranslateY = [...'Dulce'].map(() => useSharedValue(20)); // Start letters below final position
  const textOpacity = [...'Dulce'].map(() => useSharedValue(0));

  // For the final fade-out of the entire screen
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // --- PART 1: ANIMATE IN ---

    // Leaf "drops and breathes" animation
    leafOpacity.value = withTiming(1, { duration: 1000 });
    leafTranslateY.value = withSequence(
      withSpring(0, { damping: 12, stiffness: 90 }), // Drop into place
      withDelay(500, withSpring(10, { damping: 15, stiffness: 100 })), // Subtle "exhale"
      withSpring(0, { damping: 15, stiffness: 100 })   // "Inhale" back to center
    );
    
    // Staggered text reveal animation (each letter slides up and fades in)
    textOpacity.forEach((opacity, i) => {
      opacity.value = withDelay(800 + i * 150, withTiming(1, { duration: 600 }));
    });
    textTranslateY.forEach((translate, i) => {
      translate.value = withDelay(800 + i * 150, withSpring(0, { damping: 15 }));
    });

    // --- PART 2: ANIMATE OUT (THE KEY FOR A SMOOTH TRANSITION) ---
    const fadeOutDelay = 3300; // Time in milliseconds before the fade-out begins

    containerOpacity.value = withDelay(
      fadeOutDelay, 
      withTiming(0, { 
        duration: 500, // The fade-out animation takes 0.5 seconds
        easing: Easing.in(Easing.ease),
      })
    );

    // --- PART 3: NAVIGATE AWAY ---
    // Navigate to the login screen precisely when the fade-out animation finishes.
    const navigationTimer = setTimeout(() => {
      router.replace('/login');
    }, fadeOutDelay + 500); // 3300ms + 500ms = 3.8 seconds total

    // Cleanup the timer if the component unmounts for any reason
    return () => clearTimeout(navigationTimer);
  }, []);

  // --- Animated Styles ---
  
  // Style for the entire screen's fade-out
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });
  
  // Style for the leaf's drop-in and breathing
  const animatedLeafStyle = useAnimatedStyle(() => {
    return {
      opacity: leafOpacity.value,
      transform: [{ translateY: leafTranslateY.value }],
    };
  });

  return (
    <AnimatedView style={[styles.container, animatedContainerStyle]}>
      <AnimatedView style={animatedLeafStyle}>
        <Feather name="feather" size={80} color={COLORS.primary} />
      </AnimatedView>

      <View style={styles.titleContainer}>
        {[...'Dulce'].map((letter, index) => {
          // Create a unique animated style for each letter inside the map
          const animatedLetterStyle = useAnimatedStyle(() => {
            return {
              opacity: textOpacity[index].value,
              transform: [{ translateY: textTranslateY[index].value }],
            };
          });
          return (
            <AnimatedView key={index} style={animatedLetterStyle}>
              <Text style={styles.title}>{letter}</Text>
            </AnimatedView>
          );
        })}
      </View>
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
});

export default SplashScreen;