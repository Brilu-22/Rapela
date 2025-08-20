import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useActivityTracker } from '../hooks/useActivityTracker';

const { width } = Dimensions.get('window');

// --- A Refreshed, Calming Green Color Palette ---
const COLORS = {
  background: '#F0FFF4',
  container: '#FFFFFF',
  primaryText: '#2F855A',
  secondaryText: '#38A169',
  tile: '#C6F6D5',
  tileBorder: '#9AE6B4',
  booster: '#4FD1C5',
  boosterText: '#FFFFFF',
  disabled: '#A0AEC0',
};

const GRID_SIZE = 3;
const TILE_CONTAINER_WIDTH = width * 0.9;
const TILE_MARGIN = 4;
const TILE_SIZE = (TILE_CONTAINER_WIDTH - TILE_MARGIN * (GRID_SIZE - 1)) / GRID_SIZE;
useActivityTracker('zenslide'); ;

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

interface TileProps {
  value: number | null;
  index: number;
  onPress: (index: number) => void;
  onSwipe: (value: number, direction: SwipeDirection) => void;
  isSwapSelected: boolean;
  isSwapMode: boolean;
}

const Tile = React.memo(({ value, index, onPress, onSwipe, isSwapSelected, isSwapMode }: TileProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const targetX = (index % GRID_SIZE) * (TILE_SIZE + TILE_MARGIN);
    const targetY = Math.floor(index / GRID_SIZE) * (TILE_SIZE + TILE_MARGIN);
    return {
      transform: [
        { translateX: withSpring(targetX) },
        { translateY: withSpring(targetY) },
      ],
    };
  });

  const panGesture = Gesture.Pan()
    .minDistance(20)
    .onEnd((event) => {
      if (!isSwapMode && value !== null) {
        const { translationX, translationY } = event;
        if (Math.abs(translationX) > Math.abs(translationY)) {
          runOnJS(onSwipe)(value, translationX > 0 ? 'right' : 'left');
        } else {
          runOnJS(onSwipe)(value, translationY > 0 ? 'down' : 'up');
        }
      }
    });

  if (value === null) {
    return null;
  }

  return (
    <Animated.View style={[styles.tileBase, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity onPress={() => onPress(index)} style={[styles.tileButton, isSwapSelected && styles.swapSelected]}>
          <Text style={styles.tileText}>{value}</Text>
        </TouchableOpacity>
      </GestureDetector>
    </Animated.View>
  );
});

const ZenSlideGame = () => {
    const { user } = useAuth();
    const [grid, setGrid] = useState<(number | null)[]>([]);
    const [moves, setMoves] = useState(0);
    const [boosters, setBoosters] = useState(3);
    const [isSwapMode, setIsSwapMode] = useState(false);
    const [firstSwapIndex, setFirstSwapIndex] = useState<number | null>(null);
    const [leaderboard, setLeaderboard] = useState<{ moves: number; name: string }[]>([]);

    const emptyIndex = useMemo(() => grid.indexOf(null), [grid]);

    const createSolvableGrid = useCallback(() => {
        const numberedTiles: number[] = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
        const tiles: (number | null)[] = [...numberedTiles, null];
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        setGrid(tiles);
        setMoves(0);
        setBoosters(3);
    }, []);

    useEffect(() => {
        createSolvableGrid();
    }, [createSolvableGrid]);

    const saveScore = async () => {
        if (!user || moves === 0) return;
        const userName = user.displayName || 'Anonymous';
        const scoreDocRef = doc(db, 'zenSlideScores', user.uid);
        const docSnap = await getDoc(scoreDocRef);
        if (!docSnap.exists() || docSnap.data().moves > moves) {
            await setDoc(scoreDocRef, { moves, name: userName });
        }
    };
    
    useEffect(() => {
        const q = query(collection(db, 'zenSlideScores'), orderBy('moves', 'asc'), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scores = snapshot.docs.map(doc => doc.data() as { moves: number; name: string });
            setLeaderboard(scores);
        });
        return () => unsubscribe();
    }, []);

    const handleTileSwipe = (swipedValue: number, direction: SwipeDirection) => {
        if (isSwapMode || emptyIndex === -1) return;

        const swipedIndex = grid.indexOf(swipedValue);
        const [swipedRow, swipedCol] = [Math.floor(swipedIndex / GRID_SIZE), swipedIndex % GRID_SIZE];
        const [emptyRow, emptyCol] = [Math.floor(emptyIndex / GRID_SIZE), emptyIndex % GRID_SIZE];

        let isAdjacent = false;
        switch (direction) {
            case 'up':    if (swipedRow - 1 === emptyRow && swipedCol === emptyCol) isAdjacent = true; break;
            case 'down':  if (swipedRow + 1 === emptyRow && swipedCol === emptyCol) isAdjacent = true; break;
            case 'left':  if (swipedCol - 1 === emptyCol && swipedRow === emptyRow) isAdjacent = true; break;
            case 'right': if (swipedCol + 1 === emptyCol && swipedRow === emptyRow) isAdjacent = true; break;
        }

        if (isAdjacent) {
            const newGrid = [...grid];
            [newGrid[swipedIndex], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[swipedIndex]];
            setGrid(newGrid);
            setMoves(prev => prev + 1);
        }
    };
    
    const handleTileTap = (tappedIndex: number) => {
        if (isSwapMode) {
            handleSwap(tappedIndex);
        }
    };

    const handleSwap = (tappedIndex: number) => {
        if (firstSwapIndex === null) {
            setFirstSwapIndex(tappedIndex);
        } else if (firstSwapIndex !== tappedIndex) {
            const newGrid = [...grid];
            [newGrid[firstSwapIndex], newGrid[tappedIndex]] = [newGrid[tappedIndex], newGrid[firstSwapIndex]];
            setGrid(newGrid);
            
            setBoosters(prev => prev - 1);
            setIsSwapMode(false);
            setFirstSwapIndex(null);
        }
    };
    
    const toggleSwapMode = () => {
        if (boosters > 0) {
            setIsSwapMode(!isSwapMode);
            setFirstSwapIndex(null);
        }
    };

    useEffect(() => {
        const isSolved = grid.every((val, i) => val === null ? i === grid.length - 1 : val === i + 1);
        if (grid.length > 0 && isSolved) {
            saveScore();
            Alert.alert("Congratulations!", `You solved it in ${moves} moves!`, [{ text: "Play Again", onPress: createSolvableGrid }]);
        }
    }, [grid, moves, createSolvableGrid]);

    if (grid.length === 0) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={COLORS.primaryText} /></SafeAreaView>;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Zen Slide</Text>
                <View style={styles.statsContainer}>
                    <Text style={styles.statText}>Moves: {moves}</Text>
                    <TouchableOpacity onPress={toggleSwapMode} style={[styles.boosterButton, boosters === 0 && { backgroundColor: COLORS.disabled }]}>
                        <Feather name="shuffle" size={16} color={COLORS.boosterText} />
                        <Text style={styles.boosterText}>Swap ({boosters})</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.gridContainer}>
                    {grid.map((value, i) => (
                        <Tile 
                            key={value || 'empty'}
                            value={value} 
                            index={i}
                            onPress={handleTileTap}
                            onSwipe={handleTileSwipe}
                            isSwapSelected={firstSwapIndex === i}
                            isSwapMode={isSwapMode}
                        />
                    ))}
                </View>

                <View style={styles.leaderboardContainer}>
                    <Text style={styles.leaderboardTitle}>Top Solvers (Fewest Moves)</Text>
                    {leaderboard.map((entry, idx) => (
                        <View key={idx} style={styles.leaderboardRow}>
                            <Text style={styles.leaderboardText}>{idx + 1}. {entry.name}</Text>
                            <Text style={styles.leaderboardText}>{entry.moves} moves</Text>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

// --- THIS IS THE FIX: A COMPLETE STYLESHEET OBJECT ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
    title: { fontSize: 36, fontWeight: 'bold', color: COLORS.primaryText, marginVertical: 20 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: TILE_CONTAINER_WIDTH, marginBottom: 20 },
    statText: { fontSize: 20, color: COLORS.secondaryText, fontWeight: '600' },
    boosterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.booster, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    boosterText: { color: COLORS.boosterText, fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
    gridContainer: { width: TILE_CONTAINER_WIDTH, height: TILE_CONTAINER_WIDTH, backgroundColor: '#EDF2F7', borderRadius: 10, padding: TILE_MARGIN },
    tileBase: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
    tileButton: { width: '100%', height: '100%', backgroundColor: COLORS.tile, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.tileBorder, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
    tileText: { fontSize: TILE_SIZE * 0.4, color: COLORS.primaryText, fontWeight: 'bold' },
    swapSelected: { borderWidth: 3, borderColor: COLORS.booster },
    leaderboardContainer: { width: '90%', marginTop: 'auto', marginBottom: 20, backgroundColor: COLORS.container, padding: 15, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, },
    leaderboardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: COLORS.primaryText },
    leaderboardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    leaderboardText: { fontSize: 16, color: COLORS.secondaryText },
});

export default ZenSlideGame;