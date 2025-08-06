import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { ref, set, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

//This is for the game 
const GRID_SIZE = 3;
const INITIAL_TIME_PER_LEVEL = 60;
const POINTS_PER_SECOND = 10;
const SWIPE_THRESHOLD = 30;


const COLORS = {
  primary: '#E8F5E9',
  secondary: '#A5D6A7',
  text: '#388E3C',
  background: '#FFFFFF',
  tile1: '#D6EFD8',
  tile2: '#B3E1B6',
  tile3: '#8FCF92',
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


//Define the types for the props the Tile component will receive
type TileProps = {
  value: number;
  onSwipe: (value: number, swipeX: number, swipeY: number) => void;
};

//using the TileProps type to define the component's props
const Tile = ({ value, onSwipe }: TileProps) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.tile, { backgroundColor: TILE_COLORS[(value - 1) % TILE_COLORS.length] }, animatedStyle]}>
        <Text style={styles.tileText}>{value}</Text>
      </Animated.View>
    </GestureDetector>
  );
};


//here I'm defining the main game component 
const DulceFlowPuzzle = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_PER_LEVEL);
  const [gameState, setGameState] = useState<'playing' | 'solved' | 'gameOver'>('playing');
  const [leaderboard, setLeaderboard] = useState<{ score: number; name: string }[]>([]);

  const startLevel = useCallback((currentLevel: number) => {
    const newGrid = createInitialGrid(GRID_SIZE);
    setGrid(newGrid);
    setTimeLeft(Math.max(15, INITIAL_TIME_PER_LEVEL - (currentLevel - 1) * 5));
    setGameState('playing');
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
      Alert.alert("Game Over!", `Time's up! Your final score: ${score}`, [{ text: "Try Again", onPress: () => startLevel(1) }, { text: "Home", onPress: () => router.back() }]);
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && isSolved(grid)) {
      setGameState('solved');
      const pointsFromTime = timeLeft * POINTS_PER_SECOND;
      const newTotalScore = score + pointsFromTime;
      setScore(newTotalScore);
      saveScoreToLeaderboard(newTotalScore);
      Alert.alert("Level Complete!", `+${pointsFromTime} points! Total: ${newTotalScore}`, [{ text: "Next Level", onPress: () => setLevel(prev => prev + 1) }]);
    }
  }, [grid, gameState]);
  
  const saveScoreToLeaderboard = async (finalScore: number) => {
    if (!user || finalScore <= 0) return;
    const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
    try {
      const existingScoresRef = query(ref(db, `leaderboard/dulceFlowPuzzle`), orderByChild('name'), limitToLast(1));
      onValue(existingScoresRef, (snapshot) => {
        if(snapshot.hasChild(user.uid)){
          if(snapshot.val()[user.uid].score < finalScore){
            set(ref(db, `leaderboard/dulceFlowPuzzle/${user.uid}`), { score: finalScore, name: userName });
          }
        } else {
          set(ref(db, `leaderboard/dulceFlowPuzzle/${user.uid}`), { score: finalScore, name: userName });
        }
      }, { onlyOnce: true });
    } catch (error: any) {
      console.error("Score save error:", error.message);
    }
  };

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
    const tileIndex = grid.indexOf(tileValue);
    const emptyIndex = grid.indexOf(null);

    const tilePos = { row: Math.floor(tileIndex / GRID_SIZE), col: tileIndex % GRID_SIZE };
    const emptyPos = { row: Math.floor(emptyIndex / GRID_SIZE), col: emptyIndex % GRID_SIZE };

    let canMove = false;
    if (Math.abs(swipeX) > Math.abs(swipeY)) { // Horizontal swipe
      if (swipeX > 0 && tilePos.row === emptyPos.row && tilePos.col === emptyPos.col - 1) canMove = true; // Swipe Right
      if (swipeX < 0 && tilePos.row === emptyPos.row && tilePos.col === emptyPos.col + 1) canMove = true; // Swipe Left
    } else { // Vertical swipe
      if (swipeY > 0 && tilePos.col === emptyPos.col && tilePos.row === emptyPos.row - 1) canMove = true; // Swipe Down
      if (swipeY < 0 && tilePos.col === emptyPos.col && tilePos.row === emptyPos.row + 1) canMove = true; // Swipe Up
    }

    if (canMove) {
      const newGrid = [...grid];
      [newGrid[tileIndex], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[tileIndex]]; // Swap
      setGrid(newGrid);
    }
  }, [grid]);

  if (!grid.length || !user) {
    return <ActivityIndicator size="large" color={COLORS.text} style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gameTitle}>DulceFlow Puzzle</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Level: {level}</Text>
        <Text style={styles.statText}>Time: {timeLeft}</Text>
        <Text style={styles.statText}>Score: {score}</Text>
      </View>

      <View style={styles.gridContainer}>
        {grid.map((value, index) => (
          <View key={index} style={styles.tileContainer}>
            {value ? <Tile value={value} onSwipe={handleSwipe} /> : <View style={styles.emptyTile} />}
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', padding: CONTAINER_PADDING },
  gameTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  statText: { fontSize: 20, color: COLORS.text, fontWeight: 'bold' },
  gridContainer: {
    width: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
    height: (TILE_SIZE + TILE_MARGIN * 2) * GRID_SIZE,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});

export default DulceFlowPuzzle;