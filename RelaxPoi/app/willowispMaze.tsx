import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated'; // Import reanimated hooks
import StyledAlert from '../components/styledAlerts';
import { useActivityTracker } from '../hooks/useActivityTracker'; 


const { width } = Dimensions.get('window');

const COLORS = {
  background: '#1A202C',
  gridBg: '#2D3748',
  wall: '#1A202C',
  player: '#68D391',
  goal: '#9AE6B4',
  text: '#A0AEC0',
  title: '#F0FFF4',
};

const LEVELS = [
  { layout: [['S', 0, 0, 1, 'G'], [1, 1, 0, 1, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0]]},
  { layout: [[0, 0, 0, 1, 'S'], [0, 1, 0, 1, 0], [0, 1, 0, 0, 0], [0, 1, 1, 1, 0], ['G', 0, 0, 0, 0]]},
  { layout: [['S', 0, 1, 0, 0, 0], [0, 0, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0], [1, 0, 0, 0, 1, 'G'], [1, 1, 1, 0, 1, 0], [0, 0, 0, 0, 1, 0]]},
];

const WillowispMaze = () => {
  const [level, setLevel] = useState(0);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState({ row: 0, col: 0 });
  const [swipes, setSwipes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
    useActivityTracker('willowispMaze'); 

  const currentLayout = useMemo(() => LEVELS[level].layout, [level]);
  const gridSize = currentLayout.length;
  const cellSize = (width * 0.9) / gridSize;

  const setupLevel = useCallback((levelIndex: number) => {
    const layout = LEVELS[levelIndex].layout;
    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        if (layout[r][c] === 'S') setPlayerPos({ row: r, col: c });
        if (layout[r][c] === 'G') setGoalPos({ row: r, col: c });
      }
    }
    setSwipes(0);
    setIsWon(false);
    setIsAlertVisible(false);
  }, []);

  useEffect(() => {
    setupLevel(level);
  }, [level, setupLevel]);

  // --- REWRITTEN AND STABILIZED MOVEMENT LOGIC ---
  const handleMove = (dx: number, dy: number) => {
    if (isWon) return; // Prevent moves after winning

    let lastValidPos = { ...playerPos };
    
    // This stable 'for' loop prevents infinite loops and memory crashes
    for (let i = 1; i < gridSize; i++) {
      const nextRow = playerPos.row + dy * i;
      const nextCol = playerPos.col + dx * i;

      if (
        nextRow < 0 || nextRow >= gridSize ||
        nextCol < 0 || nextCol >= gridSize ||
        currentLayout[nextRow][nextCol] === 1
      ) {
        break; // Stop if we hit a wall or the edge
      }
      lastValidPos = { row: nextRow, col: nextCol };
    }

    // Only update state if the position has actually changed
    if (lastValidPos.row !== playerPos.row || lastValidPos.col !== playerPos.col) {
      setPlayerPos(lastValidPos);
      setSwipes(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!isWon && playerPos.row === goalPos.row && playerPos.col === goalPos.col) {
      setIsWon(true);
      setTimeout(() => setIsAlertVisible(true), 500);
    }
  }, [playerPos, goalPos, isWon]);

  const handleNextLevel = () => {
    setIsAlertVisible(false);
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
    } else {
      setLevel(0);
    }
  };
  
  // --- GESTURE HANDLING REWRITTEN FOR STABILITY ---
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]).activeOffsetY([-20, 20])
    .onEnd((e) => {
      const { translationX, translationY } = e;
      // Determine direction and then call the game logic function.
      // runOnJS is used to safely bridge from the UI thread to the JS thread.
      if (Math.abs(translationX) > Math.abs(translationY)) {
        runOnJS(handleMove)(translationX > 0 ? 1 : -1, 0);
      } else {
        runOnJS(handleMove)(0, translationY > 0 ? 1 : -1);
      }
    });

  if (!currentLayout) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color={COLORS.player} /></SafeAreaView>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StyledAlert
          visible={isAlertVisible}
          title={level < LEVELS.length - 1 ? "Path Found!" : "Journey's End"}
          message={level < LEVELS.length - 1 ? `You reached the leaf in ${swipes} swipes.` : `You've navigated all the mazes!`}
          buttonText={level < LEVELS.length - 1 ? "Next Maze" : "Begin Anew"}
          onConfirm={handleNextLevel}
        />
        
        <Text style={styles.title}>Willowisp Maze</Text>
        <Text style={styles.swipes}>Swipes: {swipes}</Text>

        {/* The GestureDetector wraps the grid */}
        <GestureDetector gesture={panGesture}>
          <View style={[styles.grid, { width: gridSize * cellSize, height: gridSize * cellSize }]}>
            {currentLayout.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {row.map((cell, c) => {
                  const isPlayer = playerPos.row === r && playerPos.col === c;
                  const isGoal = goalPos.row === r && goalPos.col === c;
                  return (
                    <View key={c} style={[styles.cell, { width: cellSize, height: cellSize }, cell === 1 && styles.wall]}>
                      {isPlayer && <View style={styles.player} />}
                      {isGoal && <Feather name="feather" size={cellSize * 0.6} color={COLORS.goal} />}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </GestureDetector>
        <Text style={styles.instructions}>Swipe anywhere to guide the light to the leaf.</Text>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.title, marginTop: 20 },
    swipes: { fontSize: 20, color: COLORS.text, marginVertical: 15 },
    grid: { backgroundColor: COLORS.gridBg, borderRadius: 8, borderWidth: 2, borderColor: '#4A5568' },
    cell: { justifyContent: 'center', alignItems: 'center' },
    wall: { backgroundColor: COLORS.wall },
    player: { width: '50%', height: '50%', backgroundColor: COLORS.player, borderRadius: 999, shadowColor: COLORS.player, shadowRadius: 10, shadowOpacity: 0.8, elevation: 5 },
    instructions: { fontSize: 16, color: COLORS.text, marginTop: 'auto', marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 },
});

export default WillowispMaze;