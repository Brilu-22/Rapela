import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
// Import Tap and Gesture from gesture-handler
import { Gesture, GestureDetector, GestureHandlerRootView, TapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { ref, set, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

// This is for the game
const GRID_SIZE = 3;
const INITIAL_TIME_PER_LEVEL = 60;
const POINTS_PER_SECOND = 10;
const SWIPE_THRESHOLD = 30;
const INITIAL_BOOSTERS = 3;

const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
  tile1: '#D6EFD8',
  tile2: '#B3E1B6',
  tile3: '#8FCF92',
  booster: '#FFC107',
  disabled: '#BDBDBD',
};

const TILE_COLORS = [COLORS.tile1, COLORS.tile2, COLORS.tile3];
const { width } = Dimensions.get('window');
const CONTAINER_PADDING = 20;
const TILE_MARGIN = 5;
const TILE_SIZE = (width - (CONTAINER_PADDING * 2) - (TILE_MARGIN * (GRID_SIZE * 2))) / GRID_SIZE;

const createInitialGrid = (size: number) => {
  const tiles: (number | null)[] = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
  tiles.push(null);
  return shuffleArray(tiles);
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const isSolved = (grid: (number | null)[]) => {
  for (let i = 0; i < grid.length - 1; i++) {
    if (grid[i] !== i + 1) return false;
  }
  return grid[grid.length - 1] === null;
};

type TileProps = {
  value: number;
  onSwipe: (value: number, swipeX: number, swipeY: number) => void;
  onTap: (value: number) => void;
};

// --- CORRECTED TILE COMPONENT ---
// Reverted to handle all gestures (tap and pan) within Gesture Detector
// to preserve original styling and interaction.
const Tile = ({ value, onSwipe, onTap }: TileProps) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // Tap gesture for the booster
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onTap)(value);
    });

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationX, translationY } = event;
      if (Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(translationY) > SWIPE_THRESHOLD) {
        runOnJS(onSwipe)(value, translationX, translationY);
      }
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
    })
    .onUpdate((event) => {
      offsetX.value = event.translationX;
      offsetY.value = event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
      ],
    };
  });
  
  // Use Gesture.Exclusive to combine tap and pan, ensuring only one can be active.
  const composedGesture = Gesture.Exclusive(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.tile, { backgroundColor: TILE_COLORS[(value - 1) % TILE_COLORS.length] }, animatedStyle]}>
        <Text style={styles.tileText}>{value}</Text>
      </Animated.View>
    </GestureDetector>
  );
};


const DulceFlowPuzzle = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [grid, setGrid] = useState<(number | null)[]>([]);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_PER_LEVEL);
    const [gameState, setGameState] = useState<'playing' | 'solved' | 'gameOver'>('playing');
    const [leaderboard, setLeaderboard] = useState<{ score: number; name: string }[]>([]);
    const [boosters, setBoosters] = useState(INITIAL_BOOSTERS);
    const [boosterActive, setBoosterActive] = useState(false);
  
    const saveScoreToLeaderboard = useCallback(async (finalScore: number) => {
      if (!user || finalScore <= 0) return;
      const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      try {
        const userScoreRef = ref(db, `leaderboard/dulceFlowPuzzle/${user.uid}`);
        onValue(userScoreRef, (snapshot) => {
          if (snapshot.exists() && snapshot.val().score < finalScore) {
            set(userScoreRef, { score: finalScore, name: userName });
          } else if (!snapshot.exists()) {
            set(userScoreRef, { score: finalScore, name: userName });
          }
        }, { onlyOnce: true });
      } catch (error: any) {
        console.error("Score save error:", error.message);
      }
    }, [user]);
  
    const startLevel = useCallback((currentLevel: number) => {
      const newGrid = createInitialGrid(GRID_SIZE);
      setGrid(newGrid);
      setTimeLeft(Math.max(15, INITIAL_TIME_PER_LEVEL - (currentLevel - 1) * 5));
      setGameState('playing');
      setBoosterActive(false);
  
      if (currentLevel === 1) {
        setScore(0);
        setBoosters(INITIAL_BOOSTERS);
      }
    }, []);
  
    useEffect(() => {
      startLevel(level);
    }, [level, startLevel]);
  
    useEffect(() => {
      if (gameState === 'playing' && timeLeft > 0) {
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
      }
      if (timeLeft === 0 && gameState === 'playing') {
        setGameState('gameOver');
        saveScoreToLeaderboard(score);
        Alert.alert("Game Over!", `Time's up! Your final score: ${score}`, [{ text: "Try Again", onPress: () => setLevel(1) }, { text: "Home", onPress: () => router.back() }]);
      }
    }, [gameState, timeLeft, score, router, saveScoreToLeaderboard]);
  
    useEffect(() => {
      if (gameState === 'playing' && isSolved(grid)) {
        setGameState('solved');
        const pointsFromTime = timeLeft * POINTS_PER_SECOND;
        const newTotalScore = score + pointsFromTime;
        setScore(newTotalScore);
        saveScoreToLeaderboard(newTotalScore);
        Alert.alert("Level Complete!", `+${pointsFromTime} points! Total: ${newTotalScore}`, [{ text: "Next Level", onPress: () => setLevel(prev => prev + 1) }]);
      }
    }, [grid, gameState, timeLeft, score, saveScoreToLeaderboard]);
  
    useEffect(() => {
      const topScoresQuery = query(ref(db, 'leaderboard/dulceFlowPuzzle'), orderByChild('score'), limitToLast(5));
      const unsubscribe = onValue(topScoresQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedScores = Object.values(data) as { score: number; name: string }[];
          setLeaderboard(loadedScores.sort((a, b) => b.score - a.score));
        }
      });
      return () => unsubscribe();
    }, []);
  
    const handleSwipe = useCallback((tileValue: number, swipeX: number, swipeY: number) => {
      if (boosterActive) return;
  
      const tileIndex = grid.indexOf(tileValue);
      const emptyIndex = grid.indexOf(null);
      if (tileIndex === -1 || emptyIndex === -1) return;
  
      const tilePos = { row: Math.floor(tileIndex / GRID_SIZE), col: tileIndex % GRID_SIZE };
      const emptyPos = { row: Math.floor(emptyIndex / GRID_SIZE), col: emptyIndex % GRID_SIZE };
  
      let canMove = false;
      if (Math.abs(swipeX) > Math.abs(swipeY)) {
        if (swipeX > 0 && tilePos.row === emptyPos.row && tilePos.col === emptyPos.col - 1) canMove = true;
        if (swipeX < 0 && tilePos.row === emptyPos.row && tilePos.col === emptyPos.col + 1) canMove = true;
      } else {
        if (swipeY > 0 && tilePos.col === emptyPos.col && tilePos.row === emptyPos.row - 1) canMove = true;
        if (swipeY < 0 && tilePos.col === emptyPos.col && tilePos.row === emptyPos.row + 1) canMove = true;
      }
  
      if (canMove) {
        const newGrid = [...grid];
        [newGrid[tileIndex], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[tileIndex]];
        setGrid(newGrid);
      }
    }, [grid, boosterActive]);
  
    const handleBoosterPress = () => {
      if (boosters > 0 && !boosterActive) {
        setBoosterActive(true);
        Alert.alert("Booster Activated!", "Tap any tile to swap it with the empty space.");
      }
    };
  
    const handleTileTap = (tileValue: number) => {
      if (!boosterActive) return;
  
      const tileIndex = grid.indexOf(tileValue);
      const emptyIndex = grid.indexOf(null);
      if (tileIndex === -1 || emptyIndex === -1) return;
  
      const newGrid = [...grid];
      [newGrid[tileIndex], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[tileIndex]];
      setGrid(newGrid);
  
      setBoosters(prev => prev - 1);
      setBoosterActive(false);
    };
  
    if (!grid.length || !user) {
      return <ActivityIndicator size="large" color={COLORS.text} style={{ flex: 1 }} />;
    }
  
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.gameTitle}>DulceFlow Puzzle</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Level: {level}</Text>
            <Text style={styles.statText}>Time: {timeLeft}</Text>
            <Text style={styles.statText}>Score: {score}</Text>
          </View>
  
          <TouchableOpacity
            onPress={handleBoosterPress}
            disabled={boosters <= 0 || boosterActive}
            style={[styles.boosterButton, (boosters <= 0 || boosterActive) && styles.disabledButton]}
          >
            <Text style={styles.boosterText}>
              {boosterActive ? 'Tap a Tile!' : `Boosters: ${boosters}`}
            </Text>
          </TouchableOpacity>
  
          <View style={styles.gridContainer}>
            {grid.map((value, index) => (
              <View key={index} style={styles.tileContainer}>
                {value ? (
                  <Tile
                    value={value}
                    onSwipe={handleSwipe}
                    onTap={handleTileTap}
                  />
                ) : (
                  <View style={styles.emptyTile} />
                )}
              </View>
            ))}
          </View>
  
          <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>Top Scores</Text>
            {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
              <View key={idx} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardText}>{idx + 1}. {entry.name}</Text>
                <Text style={styles.leaderboardText}>{entry.score}</Text>
              </View>
            )) : <Text style={styles.noScoresText}>Be the first to set a score!</Text>}
          </View>
  
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  };

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', padding: CONTAINER_PADDING },
    gameTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 10 },
    statText: { fontSize: 20, color: COLORS.text, fontWeight: 'bold' },
    gridContainer: {
      width: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
      height: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
      backgroundColor: COLORS.primary,
      borderRadius: 15,
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 20,
    },
    tileContainer: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      margin: TILE_MARGIN,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tile: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.secondary,
    },
    emptyTile: {
      width: '100%',
      height: '100%',
    },
    tileText: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    leaderboardContainer: { width: '100%', marginTop: 'auto', paddingHorizontal: 10, paddingTop: 10 },
    leaderboardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
    leaderboardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    leaderboardText: { fontSize: 16, color: COLORS.text },
    noScoresText: { textAlign: 'center', color: COLORS.text, opacity: 0.7, marginTop: 10 },
    boosterButton: {
      backgroundColor: COLORS.booster,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    boosterText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: COLORS.disabled,
    },
  });
  
  export default DulceFlowPuzzle;