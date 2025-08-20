import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// A calming, dark color palette for the night sky theme
const COLORS = {
  background: '#0B132B', // Deep navy blue
  starInactive: '#5A6788',
  starActive: '#EBF8FF',
  constellationLine: '#90CDF4',
  text: '#A0AEC0',
  title: '#EBF8FF',
};

// --- DATA: Define the constellations ---
// You can easily add more constellations here to expand the game
const CONSTELLATIONS = [
  {
    name: 'The Dipper',
    stars: [ { x: 0.2*width, y: 0.3*height }, { x: 0.35*width, y: 0.35*height }, { x: 0.5*width, y: 0.3*height }, { x: 0.65*width, y: 0.35*height } ]
  },
  {
    name: 'The Triangle',
    stars: [ { x: 0.5*width, y: 0.25*height }, { x: 0.3*width, y: 0.5*height }, { x: 0.7*width, y: 0.5*height } ]
  },
  {
    name: 'The Crown',
    stars: [ { x: 0.3*width, y: 0.3*height }, { x: 0.4*width, y: 0.2*height }, { x: 0.5*width, y: 0.25*height }, { x: 0.6*width, y: 0.2*height }, { x: 0.7*width, y: 0.3*height } ]
  },
];

const StarlightTapGame = () => {
  const [level, setLevel] = useState(0);
  const [tappedStars, setTappedStars] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentConstellation = CONSTELLATIONS[level];

  // Function to set up the current level
  const setupLevel = (levelIndex: number) => {
    setTappedStars(Array(CONSTELLATIONS[levelIndex].stars.length).fill(false));
    setIsCompleted(false);
  };

  useEffect(() => {
    setupLevel(level);
  }, [level]);

  const handleStarTap = (index: number) => {
    if (isCompleted) return;

    const newTappedStars = [...tappedStars];
    newTappedStars[index] = true;
    setTappedStars(newTappedStars);

    // TODO: Add a gentle sound effect here using expo-av!

    // Check if all stars have been tapped
    if (newTappedStars.every(tapped => tapped)) {
      setIsCompleted(true);
      setTimeout(() => {
        // After a delay, move to the next level or restart
        if (level < CONSTELLATIONS.length - 1) {
          setLevel(prev => prev + 1);
        } else {
          Alert.alert("Journey's End", "You've charted all the constellations for tonight.", [
            { text: 'Begin Anew', onPress: () => setLevel(0) }
          ]);
        }
      }, 2000); // Wait 2 seconds to show the completed constellation
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Starlight Tap</Text>
      
      <View style={styles.skyContainer}>
        {/* Render the lines for the completed constellation */}
        {isCompleted && (
          <Svg style={StyleSheet.absoluteFill}>
            {currentConstellation.stars.map((star, index) => {
              if (index === 0) return null;
              const prevStar = currentConstellation.stars[index - 1];
              return (
                <Line
                  key={index}
                  x1={prevStar.x}
                  y1={prevStar.y}
                  x2={star.x}
                  y2={star.y}
                  stroke={COLORS.constellationLine}
                  strokeWidth="1.5"
                />
              );
            })}
          </Svg>
        )}

        {/* Render the stars */}
        {currentConstellation.stars.map((star, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.star,
              { left: star.x - 15, top: star.y - 15 },
              tappedStars[index] && styles.starActive,
            ]}
            onPress={() => handleStarTap(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {isCompleted ? (
        <Text style={styles.constellationName}>{currentConstellation.name}</Text>
      ) : (
        <Text style={styles.instructions}>Tap the faint stars to awaken them.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.title,
    marginTop: 20,
  },
  skyContainer: {
    flex: 1,
    width: '100%',
  },
  star: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.starInactive,
    justifyContent: 'center',
    alignItems: 'center',
    // Add a subtle pulse animation if desired
  },
  starActive: {
    backgroundColor: COLORS.starActive,
    shadowColor: COLORS.starActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  instructions: {
    fontSize: 16,
    color: COLORS.text,
    padding: 30,
    textAlign: 'center',
  },
  constellationName: {
    fontSize: 22,
    color: COLORS.constellationLine,
    fontWeight: '600',
    padding: 30,
    textAlign: 'center',
  },
});

export default StarlightTapGame;