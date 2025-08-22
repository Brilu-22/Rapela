import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');


const COLORS = {
  background: '#F0F2F5',
  primary: '#4E6813',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#f9f9f9ff',
  disabled: '#9CA3AF',
};

const GRID_SIZE = 3;
const TILE_CONTAINER_WIDTH = width * 0.9;
const TILE_MARGIN = 5; 
const TILE_SIZE = (TILE_CONTAINER_WIDTH - TILE_MARGIN * (GRID_SIZE + 1)) / GRID_SIZE;

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
        { translateX: withSpring(targetX, { damping: 15, stiffness: 120 }) },
        { translateY: withSpring(targetY, { damping: 15, stiffness: 120 }) },
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
        <TouchableOpacity 
          onPress={() => onPress(index)} 
          style={[styles.tileButton, isSwapSelected && styles.swapSelected]}
          disabled={!isSwapMode}
        >
          <Text style={styles.tileText}>{value}</Text>
        </TouchableOpacity>
      </GestureDetector>
    </Animated.View>
  );
});


export default function ZenSlideGame() {
    useActivityTracker('zenslide'); 

    const { user } = useAuth();
    const router = useRouter(); 
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
        for (let i = tiles.length - 2; i > 0; i--) {
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
        try {
            const docSnap = await getDoc(scoreDocRef);
            if (!docSnap.exists() || docSnap.data().moves > moves) {
                await setDoc(scoreDocRef, { moves, name: userName });
            }
        } catch (error) {
            console.error("Error saving score:", error);
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

        let canMove = false;
        switch (direction) {
            case 'up':    if (swipedRow - 1 === emptyRow && swipedCol === emptyCol) canMove = true; break;
            case 'down':  if (swipedRow + 1 === emptyRow && swipedCol === emptyCol) canMove = true; break;
            case 'left':  if (swipedCol - 1 === emptyCol && swipedRow === emptyRow) canMove = true; break;
            case 'right': if (swipedCol + 1 === emptyCol && swipedRow === emptyRow) canMove = true; break;
        }

        if (canMove) {
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
        } else {
            setFirstSwapIndex(null);
        }
    };
    
    const toggleSwapMode = () => {
        if (boosters > 0 || isSwapMode) {
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
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.title}>Zen Slide</Text>
                <View style={{width: 48}} />
            </View>
            
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Moves</Text>
                    <Text style={styles.statValue}>{moves}</Text>
                </View>
                <TouchableOpacity onPress={toggleSwapMode} style={[styles.boosterButton, boosters === 0 && !isSwapMode && { backgroundColor: COLORS.disabled }]}>
                    <Feather name="shuffle" size={16} color="white" />
                    <Text style={styles.boosterText}>{isSwapMode ? 'Cancel' : `Swap (${boosters})`}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.gridContainer}>
                {grid.map((value, i) => (
                    <Tile 
                        key={value || `empty-${i}`}
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
                <Text style={styles.leaderboardTitle}>Top Solvers</Text>
                {leaderboard.map((entry, idx) => (
                    <View key={idx} style={styles.leaderboardRow}>
                        <Text style={styles.leaderboardText}>{idx + 1}. {entry.name}</Text>
                        <Text style={[styles.leaderboardText, {fontWeight: 'bold'}]}>{entry.moves} moves</Text>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background, 
        alignItems: 'center' 
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
    statsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '90%', 
        marginVertical: 30,
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: 15,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    boosterButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.primary, 
        paddingVertical: 12, 
        paddingHorizontal: 16, 
        borderRadius: 20 
    },
    boosterText: { 
        color: 'white', 
        fontSize: 14, 
        fontWeight: 'bold', 
        marginLeft: 8 
    },
    gridContainer: { 
        width: TILE_CONTAINER_WIDTH, 
        height: TILE_CONTAINER_WIDTH, 
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        position: 'relative',
        padding: TILE_MARGIN,
    },
    tileBase: { 
        position: 'absolute', 
        width: TILE_SIZE, 
        height: TILE_SIZE,
    },
    tileButton: { 
        width: '100%', 
        height: '100%', 
        backgroundColor: COLORS.card, 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    tileText: { 
        fontSize: TILE_SIZE * 0.4, 
        color: COLORS.textPrimary, 
        fontWeight: 'bold' 
    },
    swapSelected: { 
        borderWidth: 3, 
        borderColor: COLORS.primary 
    },
    leaderboardContainer: { 
        width: '90%', 
        marginTop: 'auto', 
        marginBottom: 20, 
        backgroundColor: COLORS.card, 
        padding: 20, 
        borderRadius: 15,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    leaderboardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 15, 
        color: COLORS.textPrimary 
    },
    leaderboardRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    leaderboardText: { 
        fontSize: 16, 
        color: COLORS.textSecondary 
    },
});