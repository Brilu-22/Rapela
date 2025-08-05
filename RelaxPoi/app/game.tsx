// app/dulceFlowPuzzle.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { ref, set, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

// --- Game Configuration ---
const GRID_SIZE = 3; // e.g., 3 for 3x3, 4 for 4x4
const INITIAL_TIME_PER_LEVEL = 60; // seconds
const POINTS_PER_SECOND = 10; // Points awarded per second remaining
const SWIPE_THRESHOLD = 20; // Minimum pixel swipe to register a move

// --- Color Palette ---
const COLORS = {
  primary: '#E8F5E9', // Lightest background
  secondary: '#A5D6A7', // Buttons, highlights
  text: '#388E3C', // Dark text
  background: '#FFFFFF', // Main background
  tile1: '#D6EFD8', // Light mint tile
  tile2: '#B3E1B6', // Medium mint tile
  tile3: '#8FCF92', // Dark mint tile
};

const TILE_COLORS = [COLORS.tile1, COLORS.tile2, COLORS.tile3]; // Colors for the puzzle

const { width } = Dimensions.get('window');
const TILE_MARGIN = 5;
const TILE_SIZE = (width - 40 - TILE_MARGIN * (GRID_SIZE * 2)) / GRID_SIZE; // Screen width - padding - total margin

// --- Utility Functions ---
const createInitialGrid = (size: number) => {
  const tiles: number[] = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
  tiles.push(0); // 0 represents the empty space
  return shuffleArray(tiles).reduce((acc: number[][], val, i) => {
    const row = Math.floor(i / size);
    if (!acc[row]) acc[row] = [];
    acc[row].push(val);
    return acc;
  }, []);
};

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  // Ensure solvability for classic 15-puzzle.
  // For a simple matching game, solvability isn't strictly necessary,
  // but it's good practice for sliding puzzles.
  return array;
};

// Checks if the grid is sorted (e.g., [1,2,3],[4,5,6],[7,8,0])
const isSolved = (grid: number[][], targetPattern: number[][]) => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== targetPattern[r][c]) {
        return false;
      }
    }
  }
  return true;
};

// --- Game Component ---
const DulceFlowPuzzle = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [grid, setGrid] = useState<number[][]>([]);
  const [emptyPos, setEmptyPos] = useState({ row: 0, col: 0 });
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_PER_LEVEL);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'solved' | 'gameOver'>('paused');
  const [targetPattern, setTargetPattern] = useState<number[][]>([]);
  const [leaderboard, setLeaderboard] = useState<{ score: number; name: string }[]>([]);

  // Animated values for each tile's position (using a map for dynamic tiles)
  const tilePositions = useRef<Map<number, { x: Animated.SharedValue<number>; y: Animated.SharedValue<number> }>>(new Map());

  // Function to initialize/reset level
  const startLevel = (currentLevel: number) => {
    const newGrid = createInitialGrid(GRID_SIZE);
    setGrid(newGrid);

    let emptyR = -1, emptyC = -1;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === 0) {
          emptyR = r;
          emptyC = c;
          break;
        }
      }
      if (emptyR !== -1) break;
    }
    setEmptyPos({ row: emptyR, col: emptyC });

    // Define target pattern for current level (e.g., all tile1 color)
    const newTargetPattern: number[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => {
        // Simple target: first GRID_SIZE*GRID_SIZE-1 tiles are '1', last is '0'
        return r * GRID_SIZE + c + 1 === GRID_SIZE * GRID_SIZE ? 0 : 1; // All same color (index 1)
      })
    );
    setTargetPattern(newTargetPattern);

    setTimeLeft(INITIAL_TIME_PER_LEVEL - (currentLevel - 1) * 5); // Less time per level
    setGameState('playing');

    // Initialize tile positions for Reanimated
    tilePositions.current.clear();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tileValue = newGrid[r][c];
        if (tileValue !== 0) {
          tilePositions.current.set(tileValue, {
            x: useSharedValue(c * (TILE_SIZE + TILE_MARGIN * 2)),
            y: useSharedValue(r * (TILE_SIZE + TILE_MARGIN * 2)),
          });
        }
      }
    }
  };

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      setGameState('gameOver');
      Alert.alert("Game Over!", `Time's up! Your score: ${score}`, [{ text: "OK", onPress: () => router.replace('/home') }]);
    }
  }, [gameState, timeLeft, score, router]);

  // Firebase Leaderboard Logic
  useEffect(() => {
    const scoresRef = ref(db, 'leaderboard/dulceFlowPuzzle');
    const topScoresQuery = query(scoresRef, orderByChild('score'), limitToLast(10));

    const unsubscribe = onValue(topScoresQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedScores: { score: number; name: string }[] = Object.values(data);
        setLeaderboard(loadedScores.sort((a, b) => b.score - a.score));
      }
    }, (error) => {
      Alert.alert("Leaderboard Error", "Could not load leaderboard: " + error.message);
    });

    return () => off(topScoresQuery);
  }, []);

  const saveScoreToLeaderboard = async (finalScore: number) => {
    if (!user || finalScore <= 0) return;
    const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
    const scoreId = user.uid + "_" + Date.now(); // Unique ID for this score entry

    try {
      await set(ref(db, `leaderboard/dulceFlowPuzzle/${scoreId}`), {
        score: finalScore,
        name: userName,
        timestamp: Date.now()
      });
      console.log("Score saved successfully!");
    } catch (error: any) {
      Alert.alert("Score Save Error", error.message);
    }
  };

  // --- Gesture Handler for Sliding Tiles ---
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (gameState !== 'playing') return;

      const { translationX, translationY } = event;
      let movedTile = { row: -1, col: -1 };
      let newEmptyPos = { ...emptyPos };
      let swapped = false;

      // Determine the direction of the swipe relative to the EMPTY space
      // If user swipes UP, empty space moves UP, so the tile BELOW moves UP.
      if (Math.abs(translationY) > Math.abs(translationX) && Math.abs(translationY) > SWIPE_THRESHOLD) {
        if (translationY < 0 && emptyPos.row < GRID_SIZE - 1) { // Swipe Up -> Empty moves up -> Tile below empty moves up
          movedTile = { row: emptyPos.row + 1, col: emptyPos.col };
          newEmptyPos = { row: emptyPos.row + 1, col: emptyPos.col };
          swapped = true;
        } else if (translationY > 0 && emptyPos.row > 0) { // Swipe Down -> Empty moves down -> Tile above empty moves down
          movedTile = { row: emptyPos.row - 1, col: emptyPos.col };
          newEmptyPos = { row: emptyPos.row - 1, col: emptyPos.col };
          swapped = true;
        }
      } else if (Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > SWIPE_THRESHOLD) {
        if (translationX < 0 && emptyPos.col < GRID_SIZE - 1) { // Swipe Left -> Empty moves left -> Tile right of empty moves left
          movedTile = { row: emptyPos.row, col: emptyPos.col + 1 };
          newEmptyPos = { row: emptyPos.row, col: emptyPos.col + 1 };
          swapped = true;
        } else if (translationX > 0 && emptyPos.col > 0) { // Swipe Right -> Empty moves right -> Tile left of empty moves right
          movedTile = { row: emptyPos.row, col: emptyPos.col - 1 };
          newEmptyPos = { row: emptyPos.row, col: emptyPos.col - 1 };
          swapped = true;
        }
      }

      if (swapped) {
        const newGrid = grid.map(row => [...row]); // Deep copy grid
        const tileValue = newGrid[movedTile.row][movedTile.col];

        // Animate the tile before updating grid state
        const animX = tilePositions.current.get(tileValue)?.x;
        const animY = tilePositions.current.get(tileValue)?.y;
        if (animX && animY) {
            animX.value = withSpring(emptyPos.col * (TILE_SIZE + TILE_MARGIN * 2));
            animY.value = withSpring(emptyPos.row * (TILE_SIZE + TILE_MARGIN * 2), {}, () => {
                // Update grid state after animation is complete
                runOnJS(setGrid)((prevGrid) => {
                    const nextGrid = prevGrid.map(row => [...row]);
                    nextGrid[emptyPos.row][emptyPos.col] = tileValue;
                    nextGrid[movedTile.row][movedTile.col] = 0;
                    return nextGrid;
                });
                runOnJS(setEmptyPos)(newEmptyPos);
                // Reset tile's animated position for next move, back to its new grid spot
                runOnJS(() => {
                    animX.value = newEmptyPos.col * (TILE_SIZE + TILE_MARGIN * 2);
                    animY.value = newEmptyPos.row * (TILE_SIZE + TILE_MARGIN * 2);
                });
            });
        }
      }
    });

    // Check for win condition after grid updates
    useEffect(() => {
        if (grid.length > 0 && gameState === 'playing' && isSolved(grid, targetPattern)) {
            setGameState('solved');
            const calculatedScore = score + timeLeft * POINTS_PER_SECOND;
            setScore(calculatedScore);
            Alert.alert("Level Complete!", `Score: ${calculatedScore}`, [
                { text: "Next Level", onPress: () => {
                    saveScoreToLeaderboard(calculatedScore); // Save score
                    setLevel(prev => prev + 1);
                    startLevel(level + 1);
                }},
                { text: "Back to Home", onPress: () => router.replace('/home') }
            ]);
        }
    }, [grid, gameState, targetPattern, score, timeLeft, level, router]);


  // Initial load or level restart
  useEffect(() => {
    startLevel(level);
  }, [level]);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => b.score - a.score);
  }, [leaderboard]);


  if (!user) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.text} />;


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gameTitle}>DulceFlow Puzzle</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Level: {level}</Text>
        <Text style={styles.statText}>Time: {timeLeft}</Text>
        <Text style={styles.statText}>Score: {score}</Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.gridContainer}>
          {grid.flat().map((tileValue, index) => {
            if (tileValue === 0) return (
              <View key="empty" style={[styles.tile, styles.emptyTile]} />
            );

            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const tileStyle = tilePositions.current.get(tileValue);

            return (
              <Animated.View
                key={tileValue}
                style={[
                  styles.tile,
                  { backgroundColor: TILE_COLORS[tileValue - 1 % TILE_COLORS.length] }, // Use tileValue for color
                  tileStyle ? useAnimatedStyle(() => ({
                    transform: [{ translateX: tileStyle.x.value }, { translateY: tileStyle.y.value }]
                  })) : { left: col * (TILE_SIZE + TILE_MARGIN * 2), top: row * (TILE_SIZE + TILE_MARGIN * 2) } // Fallback for initial render
                ]}
              >
                <Text style={styles.tileText}>{tileValue}</Text>
              </Animated.View>
            );
          })}
        </View>
      </GestureDetector>

      <TouchableOpacity style={styles.resetButton} onPress={() => startLevel(1)}>
        <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>

      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Top Scores</Text>
        {sortedLeaderboard.length === 0 ? (
            <Text style={styles.noScoresText}>No scores yet! Be the first!</Text>
        ) : (
            sortedLeaderboard.map((entry, index) => (
                <View key={index} style={styles.leaderboardRow}>
                    <Text style={styles.leaderboardRank}>{index + 1}.</Text>
                    <Text style={styles.leaderboardName}>{entry.name}</Text>
                    <Text style={styles.leaderboardScore}>{entry.score}</Text>
                </View>
            ))
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', padding: 20 },
  gameTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 },
  statText: { fontSize: 20, color: COLORS.text, fontWeight: 'bold' },
  gridContainer: {
    width: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
    height: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    overflow: 'hidden', // Crucial for containing animated tiles
    position: 'relative', // For absolute positioning of tiles
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: TILE_MARGIN,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Make tiles absolutely positioned for animation
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  emptyTile: {
    backgroundColor: COLORS.background, // Empty space matches background
    borderColor: 'transparent',
  },
  tileText: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  resetButton: { backgroundColor: COLORS.secondary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginBottom: 30 },
  resetButtonText: { color: COLORS.background, fontSize: 18, fontWeight: 'bold' },
  leaderboardContainer: { width: '100%', paddingHorizontal: 10, borderTopWidth: 1, borderColor: COLORS.primary, paddingTop: 10 },
  leaderboardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 15, textAlign: 'center' },
  leaderboardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: COLORS.primary },
  leaderboardRank: { fontSize: 16, color: COLORS.text, fontWeight: 'bold', width: 30 },
  leaderboardName: { fontSize: 16, color: COLORS.text, flex: 1 },
  leaderboardScore: { fontSize: 16, color: COLORS.text, fontWeight: 'bold' },
  noScoresText: { textAlign: 'center', color: COLORS.text, opacity: 0.7, marginTop: 10 },
});

export default DulceFlowPuzzle;