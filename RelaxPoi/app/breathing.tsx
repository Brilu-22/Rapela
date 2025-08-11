import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  useAnimatedProps,
  cancelAnimation,
  useDerivedValue,
} from 'react-native-reanimated';

// Create an animatable version of TextInput for reanimated to control
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const BreathingScreen = () => {
  const progress = useSharedValue(0);
  const isHolding = useSharedValue(false);
  const timerValue = useSharedValue(7);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isHolding.value = true;
      // As soon as the swipe starts, begin the 7-second timer animation
      timerValue.value = withTiming(0, { duration: 7000 });
    })
    .onUpdate((event) => {
      // User controls the circle's size with their swipe distance
      progress.value = Math.max(0, Math.min(1, -event.translationY / 300));
    })
    .onEnd(() => {
      cancelAnimation(progress);
      cancelAnimation(timerValue);
      isHolding.value = false;
      progress.value = withSpring(0);
      timerValue.value = withSpring(7); // Reset timer with a spring for a smooth reset
    });

  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = 1 + progress.value * 0.6;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#A5D6A7', '#4CAF50']
    );
    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });
  
  
  const initialInstructionProps = useAnimatedProps(() => ({ value: 'Swipe up to breathe in' }));
  const initialInstructionStyle = useAnimatedStyle(() => ({
    
    opacity: isHolding.value ? 0 : 1,
  }));
  
  
  const animatedTimerTextProps = useAnimatedProps(() => ({
    value: `${Math.ceil(timerValue.value)}`,
  }));
  const animatedTimerStyle = useAnimatedStyle(() => ({
   
    opacity: isHolding.value ? 1 : 0,
  }));

  
  const secondaryInstructionText = useDerivedValue(() => {
    if (progress.value > 0.95) return 'Hold';
    return 'Inhale...';
  });
  const secondaryInstructionProps = useAnimatedProps(() => ({
    value: secondaryInstructionText.value,
  }));
  const secondaryInstructionStyle = useAnimatedStyle(() => ({
    
    opacity: isHolding.value ? 1 : 0,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <Text style={styles.subInstructionText}>Release to exhale</Text>
          <Animated.View style={[styles.circle, animatedCircleStyle]}>
            
            <AnimatedTextInput
              style={[styles.sharedTextStyle, styles.instructionText, initialInstructionStyle]}
              animatedProps={initialInstructionProps}
              editable={false}
              multiline
            />
            
            
            <AnimatedTextInput
              style={[styles.sharedTextStyle, styles.timerText, animatedTimerStyle]}
              animatedProps={animatedTimerTextProps}
              editable={false}
              multiline
            />

            
            <AnimatedTextInput
              style={[styles.sharedTextStyle, styles.secondaryInstruction, secondaryInstructionStyle]}
              animatedProps={secondaryInstructionProps}
              editable={false}
              multiline
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedTextStyle: {
    position: 'absolute',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    width: 200,
  },
  instructionText: {
    fontSize: 28,
  },
  timerText: {
    fontSize: 60,
  },
  // New style for the smaller "Inhale..." text
  secondaryInstruction: {
    fontSize: 24,
    marginTop: 80, // Position it below the large timer number
  },
  subInstructionText: {
    position: 'absolute',
    bottom: 80,
    fontSize: 18,
    color: '#388E3C',
    opacity: 0.7,
  },
});

export default BreathingScreen;