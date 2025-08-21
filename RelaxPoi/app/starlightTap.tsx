// app/(app)/starlightTap.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useActivityTracker } from '../hooks/useActivityTracker';
import Animated, { useSharedValue, useAnimatedProps, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const SKY_CONTAINER_WIDTH = width * 0.9;
const SKY_CONTAINER_HEIGHT = SKY_CONTAINER_WIDTH * 1.2;
const STAR_RADIUS = 15;

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  starInactive: '#D1D5DB',
  starActive: '#FBBF24',
  constellationLine: '#6EE7B7',
  lineDrawing: '#A7F3D0',
};

const CONSTELLATIONS = [
  { name: 'The Arrow', stars: [ { x: 0.5, y: 0.2 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.8 } ] },
  { name: 'The Triangle', stars: [ { x: 0.5, y: 0.25 }, { x: 0.3, y: 0.6 }, { x: 0.7, y: 0.6 } ] },
  { name: 'The Hook', stars: [ { x: 0.2, y: 0.3 }, { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.6 }, { x: 0.8, y: 0.6 } ] },
  { name: 'The Kite', stars: [ { x: 0.5, y: 0.15 }, { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.4 }, { x: 0.5, y: 0.8 } ] },
  { name: 'The Crown', stars: [ { x: 0.2, y: 0.4 }, { x: 0.35, y: 0.2 }, { x: 0.5, y: 0.3 }, { x: 0.65, y: 0.2 }, { x: 0.8, y: 0.4 } ] },
  { name: 'The Goblet', stars: [ { x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.4 }, { x: 0.5, y: 0.7 } ] },
  { name: 'The Serpent', stars: [ { x: 0.2, y: 0.2 }, { x: 0.4, y: 0.4 }, { x: 0.3, y: 0.6 }, { x: 0.5, y: 0.8 }, { x: 0.7, y: 0.7 }, { x: 0.8, y: 0.5 } ] },
  { name: 'The Big Dipper', stars: [ { x: 0.8, y: 0.2 }, { x: 0.65, y: 0.35 }, { x: 0.5, y: 0.3 }, { x: 0.35, y: 0.4 }, { x: 0.2, y: 0.6 }, { x: 0.4, y: 0.65 }, { x: 0.55, y: 0.5 } ] },
  { name: 'The Swan', stars: [ { x: 0.5, y: 0.1 }, { x: 0.5, y: 0.4 }, { x: 0.2, y: 0.3 }, { x: 0.8, y: 0.3 }, { x: 0.5, y: 0.7 }, { x: 0.4, y: 0.9 }, { x: 0.6, y: 0.9 } ] },
  { name: 'The Phoenix', stars: [ { x: 0.5, y: 0.1 }, { x: 0.4, y: 0.3 }, { x: 0.6, y: 0.3 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.7 }, { x: 0.7, y: 0.7 }, { x: 0.4, y: 0.9 }, { x: 0.6, y: 0.9 } ] },
];

const AnimatedLine = Animated.createAnimatedComponent(Line);

const StarlightSwipeGame = () => {
  useActivityTracker('starlightTap');
  const router = useRouter();
  const [level, setLevel] = useState(0);
  const [drawnPath, setDrawnPath] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const lineToX = useSharedValue(0);
  const lineToY = useSharedValue(0);

  // Memoize the current constellation to ensure it's stable during re-renders
  const currentConstellation = useMemo(() => CONSTELLATIONS[level], [level]);

  const setupLevel = useCallback((levelIndex: number) => {
    setDrawnPath([]);
    setIsCompleted(false);
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    setupLevel(level);
  }, [level, setupLevel]);

  const isFingerOverStar = (fingerX: number, fingerY: number, starIndex: number) => {
    // Safety check
    if (!currentConstellation || !currentConstellation.stars[starIndex]) {
        return false;
    }
    const star = currentConstellation.stars[starIndex];
    const starX = star.x * SKY_CONTAINER_WIDTH;
    const starY = star.y * SKY_CONTAINER_HEIGHT;
    const distance = Math.sqrt(Math.pow(fingerX - starX, 2) + Math.pow(fingerY - starY, 2));
    return distance < STAR_RADIUS * 1.5;
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      // Safety check
      if (!currentConstellation) return;
      if (drawnPath.length === 0 && isFingerOverStar(event.x, event.y, 0)) {
        const firstStar = currentConstellation.stars[0];
        // Safety check
        if (!firstStar) return;
        lineToX.value = firstStar.x * SKY_CONTAINER_WIDTH;
        lineToY.value = firstStar.y * SKY_CONTAINER_HEIGHT;
        runOnJS(setIsDrawing)(true);
        runOnJS(setDrawnPath)([0]);
      }
    })
    .onUpdate((event) => {
      // Safety check
      if (!isDrawing || !currentConstellation) return;
      lineToX.value = event.x;
      lineToY.value = event.y;
      const nextStarIndex = drawnPath.length;
      if (nextStarIndex < currentConstellation.stars.length) {
        if (isFingerOverStar(event.x, event.y, nextStarIndex)) {
          runOnJS(setDrawnPath)((currentPath) => [...currentPath, nextStarIndex]);
        }
      }
    })
    .onEnd(() => {
      // Safety check
      if (!isDrawing) return;
      runOnJS(setIsDrawing)(false);
      
      if (drawnPath.length === currentConstellation.stars.length) {
        runOnJS(setIsCompleted)(true);
        setTimeout(() => {
          if (level < CONSTELLATIONS.length - 1) {
            runOnJS(setLevel)(level + 1);
          } else {
            runOnJS(Alert.alert)("Journey's End", "You've charted all the constellations.", [
              { text: 'Begin Anew', onPress: () => setLevel(0) }
            ]);
          }
        }, 1500);
      } else {
        runOnJS(setDrawnPath)([]);
      }
    });

  const animatedLineProps = useAnimatedProps(() => {
    return {
      x2: lineToX.value,
      y2: lineToY.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Starlight Swipe</Text>
        <View style={styles.levelIndicator}>
            <Text style={styles.levelText}>Level {level + 1}</Text>
        </View>
      </View>
      
      <GestureDetector gesture={panGesture}>
        <View style={styles.skyContainer}>
          <Svg style={StyleSheet.absoluteFill}>
            {drawnPath.map((starIndex, i) => {
              if (i === 0) return null;
              const prevStar = currentConstellation?.stars[drawnPath[i - 1]];
              const currentStar = currentConstellation?.stars[starIndex];
              // Safety check
              if (!prevStar || !currentStar) return null;
              return (
                <Line
                  key={`line-${i}`}
                  x1={prevStar.x * SKY_CONTAINER_WIDTH} y1={prevStar.y * SKY_CONTAINER_HEIGHT}
                  x2={currentStar.x * SKY_CONTAINER_WIDTH} y2={currentStar.y * SKY_CONTAINER_HEIGHT}
                  stroke={isCompleted ? COLORS.constellationLine : COLORS.lineDrawing}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            {isDrawing && drawnPath.length > 0 && currentConstellation?.stars[drawnPath[drawnPath.length - 1]] && (
              <AnimatedLine
                x1={currentConstellation.stars[drawnPath[drawnPath.length - 1]].x * SKY_CONTAINER_WIDTH}
                y1={currentConstellation.stars[drawnPath[drawnPath.length - 1]].y * SKY_CONTAINER_HEIGHT}
                animatedProps={animatedLineProps}
                stroke={COLORS.primary}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </Svg>

          {currentConstellation?.stars.map((star, index) => {
             const isTapped = drawnPath.includes(index);
             const isNext = !isCompleted && drawnPath.length === index;
             return (
                <View
                    key={index}
                    style={[
                        styles.star,
                        { left: star.x * SKY_CONTAINER_WIDTH - STAR_RADIUS, top: star.y * SKY_CONTAINER_HEIGHT - STAR_RADIUS },
                        isTapped && styles.starActive,
                        isNext && styles.starNext,
                    ]}
                />
             );
          })}
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={styles.instructions}>
          {isCompleted ? `You found ${currentConstellation?.name}!` : 'Press and drag to connect the stars.'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerButton: {
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  levelIndicator: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  skyContainer: {
    width: SKY_CONTAINER_WIDTH,
    height: SKY_CONTAINER_HEIGHT,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginTop: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  star: {
    position: 'absolute',
    width: STAR_RADIUS * 2,
    height: STAR_RADIUS * 2,
    borderRadius: STAR_RADIUS,
    backgroundColor: COLORS.starInactive,
  },
  starActive: {
    backgroundColor: COLORS.starActive,
    shadowColor: COLORS.starActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  starNext: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  footer: {
    marginTop: 'auto',
    padding: 30,
    alignItems: 'center',
  },
  instructions: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default StarlightSwipeGame;