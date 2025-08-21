// app/(app)/starlightTap.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useActivityTracker } from '../hooks/useActivityTracker';
import * as Haptics from 'expo-haptics';
// ---> FIX: Corrected import path assuming components folder is at the root <---
import { CompletionModal } from '../components/completitionModal';

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
  error: '#F87171',
};

const CONSTELLATIONS = [
  // ... your 10 constellations ...
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

const StarlightTapGame = () => {
  useActivityTracker('starlightTap');
  const router = useRouter();
  const [level, setLevel] = useState(0);
  const [tappedPath, setTappedPath] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // ---> FIX 1: Define the state and handler function here, at the top level <---
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleResetGame = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setLevel(0);
    }, 300); // Delay allows modal to animate out
  };

  const currentConstellation = CONSTELLATIONS[level];

  const setupLevel = useCallback((levelIndex: number) => {
    setTappedPath([]);
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    setupLevel(level);
  }, [level, setupLevel]);

  const handleStarTap = (tappedIndex: number) => {
    if (isCompleted) return;
    const nextIndexInSequence = tappedPath.length;

    if (tappedIndex === nextIndexInSequence) {
      const newPath = [...tappedPath, tappedIndex];
      setTappedPath(newPath);

      if (newPath.length === currentConstellation.stars.length) {
        setIsCompleted(true);
        setTimeout(() => {
          if (level < CONSTELLATIONS.length - 1) {
            setLevel(prev => prev + 1);
          } else {
            // ---> FIX 2: Call the state setter function to show the modal <---
            setIsModalVisible(true);
          }
        }, 1500);
      }
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setTappedPath([]);
    }
  };

  return (
    // Use a React Fragment <> to return multiple components at the same level
    <>
      {/* ---> FIX 3: Render the modal here, in the main return statement <--- */}
      <CompletionModal
        visible={isModalVisible}
        title="Journey's End"
        message="You've charted all the constellations for tonight."
        buttonText="Begin Anew"
        onButtonPress={handleResetGame}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Starlight Tap</Text>
          <View style={styles.levelIndicator}>
              <Text style={styles.levelText}>Level {level + 1}</Text>
          </View>
        </View>
        
        <View style={styles.skyContainer}>
          <Svg style={StyleSheet.absoluteFill}>
            {tappedPath.map((starIndex, i) => {
              if (i === 0) return null;
              const prevStar = currentConstellation.stars[tappedPath[i - 1]];
              const currentStar = currentConstellation.stars[starIndex];
              if (!prevStar || !currentStar) return null;
              return (
                <Line
                  key={`line-${i}`}
                  x1={prevStar.x * SKY_CONTAINER_WIDTH} y1={prevStar.y * SKY_CONTAINER_HEIGHT}
                  x2={currentStar.x * SKY_CONTAINER_WIDTH} y2={currentStar.y * SKY_CONTAINER_HEIGHT}
                  stroke={isCompleted ? COLORS.constellationLine : COLORS.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>

          {currentConstellation.stars.map((star, index) => {
              const isTapped = tappedPath.includes(index);
              const isNext = !isCompleted && tappedPath.length === index;
              return (
                  <TouchableOpacity
                      key={index}
                      style={[
                          styles.star,
                          { left: star.x * SKY_CONTAINER_WIDTH - STAR_RADIUS, top: star.y * SKY_CONTAINER_HEIGHT - STAR_RADIUS },
                          isTapped && styles.starActive,
                          isNext && styles.starNext,
                      ]}
                      onPress={() => handleStarTap(index)}
                      activeOpacity={0.7}
                  />
              );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.instructions}>
            {isCompleted ? `You found ${currentConstellation.name}!` : 'Tap the stars in order to connect them.'}
          </Text>
        </View>
      </SafeAreaView>
    </>
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

export default StarlightTapGame;