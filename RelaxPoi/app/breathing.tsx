// app/game.tsx

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useDerivedValue, interpolateColor } from 'react-native-reanimated';

const GameScreen = () => {
  const progress = useSharedValue(0); // 0 = fully exhaled, 1 = fully inhaled

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Normalize vertical swipe to a 0-1 range. Invert Y so up is positive.
      const newProgress = Math.max(0, Math.min(1, -event.translationY / 300));
      progress.value = newProgress;
    })
    .onEnd(() => {
      // Animate back to the bottom (exhaled state) with a spring effect
      progress.value = withSpring(0);
    });

  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = 1 + progress.value * 0.6; // Grow up to 1.6x size
    const backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        ['#A5D6A7', '#4CAF50'] // From light green to a deeper green
    );
    return {
        transform: [{ scale }],
        backgroundColor,
    };
  });

  const instructionText = useDerivedValue(() => {
    if (progress.value > 0.9) return 'Hold';
    if (progress.value > 0.1) return 'Inhale...';
    return 'Swipe up to breathe in';
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Text style={styles.subInstructionText}>Release to exhale</Text>
        <Animated.View style={[styles.circle, animatedCircleStyle]} />
        <Animated.Text style={styles.instructionText}>
            {instructionText.value}
        </Animated.Text>
      </View>
    </GestureDetector>
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
  },
  instructionText: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subInstructionText: {
    position: 'absolute',
    bottom: 80,
    fontSize: 18,
    color: '#388E3C',
    opacity: 0.7,
  },
});

export default GameScreen;