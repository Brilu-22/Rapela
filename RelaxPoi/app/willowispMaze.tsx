import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { runOnJS } from 'react-native-reanimated';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { CompletionModal } from '../components/completitionModal';
import { InstructionsModal } from '../components/InstructionsModal';
import * as Haptics from 'expo-haptics';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F0F2F5',
  primary: '#4E6813',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  player: '#1D6517',
  wall: '#E5E7EB',
  hazard: '#FEE2E2',
  hazardIcon: '#2b3b1bff',
  shield: '#C0DE7B',
};

const LEVELS = [
    { time: 30, layout: [['S', 0, 1, 0, 0], [0, 0, 1, 2, 0], [1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [0, 0, 0, 0, 'G']] },
    { time: 25, layout: [[2, 1, 'S', 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0], [1, 1, 0, 1, 'G'], [2, 0, 0, 0, 2]] },
    { time: 30, layout: [['S', 0, 0, 0, 1, 'G'], [1, 1, 0, 1, 1, 0], [0, 2, 0, 0, 2, 0], [0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 1, 0], [1, 1, 1, 0, 0, 0]] },
    { time: 25, layout: [['S', 1, 0, 0, 0, 1, 'G'], [0, 1, 0, 1, 0, 1, 0], [0, 1, 2, 1, 2, 1, 0], [0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0]] },
    { time: 35, layout: [[0, 0, 1, 2, 1, 'S'], [0, 0, 1, 0, 1, 0], [0, 0, 0, 0, 1, 0], [1, 1, 1, 0, 1, 0], [2, 0, 0, 0, 2, 0], ['G', 1, 1, 1, 1, 0]] },
    { time: 30, layout: [[0, 2, 0, 0, 0, 0, 0, 'S'], [0, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 2, 1, 0], [0, 1, 0, 1, 1, 0, 1, 0], [0, 0, 0, 1, 'G', 0, 1, 0], [1, 1, 1, 1, 1, 0, 1, 0], [0, 2, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 1, 1, 1, 0]] },
    { time: 25, layout: [['S', 0, 0, 0, 1, 0, 0], [1, 1, 1, 0, 1, 0, 1], [0, 2, 0, 0, 1, 2, 0], [0, 1, 1, 0, 0, 1, 0], [0, 1, 0, 0, 1, 1, 0], [0, 1, 0, 1, 2, 0, 0], [0, 'G', 0, 1, 0, 1, 0]] },
    { time: 40, layout: [['0', '1', '2', '0', '0', '0', '0', 'S'], ['0', '1', '0', '1', '1', '1', '0', '0'], ['0', '0', '0', '1', '0', '0', '0', '1'], ['1', '0', '1', '1', '0', '1', '0', '1'], ['0', '0', '0', '0', '0', '1', '0', '1'], ['0', '1', '1', '1', '1', '1', '0', '1'], ['G', '2', '0', '0', '0', '0', '0', '1']] },
    { time: 35, layout: [['S', 0, 0, 2, 0, 0, 0, 0], [1, 1, 1, 0, 1, 1, 0, 1], [0, 0, 0, 0, 0, 1, 0, 1], [0, 1, 1, 1, 0, 1, 0, 1], [0, 1, 2, 0, 0, 0, 0, 1], [0, 1, 0, 1, 1, 1, 0, 1], [0, 0, 0, 0, 0, 'G', 0, 1]] },
    { time: 30, layout: [['S', 0, 2, 1, 0, 2, 0, 0], [1, 0, 1, 1, 0, 1, 1, 0], [2, 0, 0, 0, 0, 1, 2, 0], [0, 1, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 0, 0, 1], [1, 0, 1, 2, 0, 0, 1, 1], [0, 0, 1, 1, 1, 0, 1, 'G'], [0, 1, 0, 0, 0, 0, 0, 0]] },
];

const CONTAINER_PADDING = 20;
const TILE_CONTAINER_WIDTH = width * 0.9;
const TILE_MARGIN = 5;


type GameRule = {
  icon: React.ComponentProps<typeof Feather>['name']; 
  text: string;
};


const gameRules: GameRule[] = [
    { icon: 'move', text: 'Swipe anywhere to move the wisp one square at a time.' },
    { icon: 'feather', text: 'Reach the green leaf to complete the level before time runs out.' },
    { icon: 'alert-triangle', text: 'Hitting red hazard blocks costs you 5 seconds of time!' },
    { icon: 'shield', text: 'Tap the Shield button once to use a Lifer. It protects you from the next hazard you hit.' },
    { icon: 'award', text: 'Your final score is based on the total time remaining after all levels.' },
];


const WillowispMaze = () => {
  useActivityTracker('willowispMaze');
  const router = useRouter();
  const { user } = useAuth();

  const [level, setLevel] = useState(0);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState({ row: 0, col: 0 });
  const [swipes, setSwipes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ score: number; name: string }[]>([]);
  const [lifers, setLifers] = useState(3);
  const [isLiferActive, setIsLiferActive] = useState(false);
  const [isRulesVisible, setIsRulesVisible] = useState(true);

  const currentLevelData = useMemo(() => LEVELS[level], [level]);
  const gridSize = currentLevelData.layout.length;
  const cellSize = (width * 0.9) / gridSize;

  const setupLevel = useCallback((levelIndex: number, isFullReset = false) => {
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
    setIsLiferActive(false);
    setTimeLeft(LEVELS[levelIndex].time);
    if (isFullReset) {
      setLifers(3);
      setScore(0);
    }
  }, []);

  useEffect(() => {
    setupLevel(level);
  }, [level, setupLevel]);

  useEffect(() => {
    if (isWon || timeLeft <= 0 || isRulesVisible) {
        if(timeLeft <= 0 && !isWon){
            Alert.alert("Time's Up!", "The wisp faded. Try again.", [{ text: 'Restart Level', onPress: () => setupLevel(level) }]);
        }
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isWon, level, setupLevel, isRulesVisible]);
  
  const handleMove = (dx: number, dy: number) => {
    if (isWon || isRulesVisible) return;
    const nextRow = playerPos.row + dy;
    const nextCol = playerPos.col + dx;

    if (nextRow >= 0 && nextRow < gridSize && nextCol >= 0 && nextCol < gridSize) {
      const nextCell = currentLevelData.layout[nextRow][nextCol];
      
      if (nextCell === 1) return;
      
      if (nextCell === 2) {
        if (isLiferActive) {
            setLifers(prev => prev - 1);
            setIsLiferActive(false);
        } else {
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeLeft(prev => Math.max(0, prev - 5));
            return; 
        }
      }
      
      if (isLiferActive) setIsLiferActive(false); 

      setPlayerPos({ row: nextRow, col: nextCol });
      setSwipes(prev => prev + 1);
    }
  };
  
  const saveScoreToLeaderboard = async (finalScore: number) => {
    if (!user || finalScore <= 0) return;
    const userName = user.displayName || 'Anonymous';
    const scoreDocRef = doc(db, 'willowispScores', user.uid);
    try {
        const docSnap = await getDoc(scoreDocRef);
        if (!docSnap.exists() || docSnap.data().score < finalScore) {
            await setDoc(scoreDocRef, { score: finalScore, name: userName });
        }
    } catch (error) {
        console.error("Error saving score:", error);
    }
  };

  useEffect(() => {
    if (!isWon && playerPos.row === goalPos.row && playerPos.col === goalPos.col) {
      setIsWon(true);
      const pointsFromTime = timeLeft * 10;
      const newTotalScore = score + pointsFromTime;
      setScore(newTotalScore);
      if (level === LEVELS.length - 1) {
        saveScoreToLeaderboard(newTotalScore);
      }
      setTimeout(() => setIsAlertVisible(true), 500);
    }
  }, [playerPos, goalPos, isWon, timeLeft, score, level]);

  useEffect(() => {
    const q = query(collection(db, 'willowispScores'), orderBy('score', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const scores = snapshot.docs.map(doc => doc.data() as { score: number; name: string });
        setLeaderboard(scores);
    });
    return () => unsubscribe();
  }, []);

  const handleNextLevel = () => {
    setIsAlertVisible(false);
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
    } else {
      setupLevel(0, true);
    }
  };
  
  const handleActivateLifer = () => {
    if (lifers > 0 && !isLiferActive) {
      setIsLiferActive(true);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]).activeOffsetY([-20, 20])
    .onEnd((e) => {
      const { translationX, translationY } = e;
      if (Math.abs(translationX) > Math.abs(translationY)) {
        runOnJS(handleMove)(translationX > 0 ? 1 : -1, 0);
      } else {
        runOnJS(handleMove)(0, translationY > 0 ? 1 : -1);
      }
    });

  if (!currentLevelData) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color={COLORS.primary} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <InstructionsModal
        visible={isRulesVisible}
        title="How to Play Willowisp Maze"
        rules={gameRules}
        buttonText="Let's Begin"
        onClose={() => setIsRulesVisible(false)}
      />
      <CompletionModal
        visible={isAlertVisible}
        title={level < LEVELS.length - 1 ? "Path Found!" : "Journey's End"}
        message={level < LEVELS.length - 1 ? `You reached the goal with ${timeLeft}s left!` : `You've navigated all mazes! Final Score: ${score}`}
        buttonText={level < LEVELS.length - 1 ? "Next Maze" : "Begin Anew"}
        onButtonPress={handleNextLevel}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Willowisp Maze</Text>
        <View style={{width: 48}} />
      </View>

      <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Level</Text><Text style={styles.statValue}>{level + 1}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Time</Text><Text style={styles.statValue}>{timeLeft}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Swipes</Text><Text style={styles.statValue}>{swipes}</Text></View>
          
          <TouchableOpacity 
            onPress={handleActivateLifer} 
            disabled={lifers === 0 || isLiferActive}
            style={[styles.statBox, styles.liferButton, lifers === 0 && !isLiferActive && styles.disabledLifer, isLiferActive && styles.liferActive]}
          >
            <Text style={[styles.statLabel, {color: isLiferActive ? 'white' : COLORS.textSecondary}]}>LIFER</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="shield" size={20} color={isLiferActive ? 'white' : COLORS.textPrimary} />
              <Text style={[styles.statValue, {marginLeft: 8, color: isLiferActive ? 'white' : COLORS.textPrimary}]}>{lifers}</Text>
            </View>
          </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={[styles.gridContainer, { width: gridSize * cellSize, height: gridSize * cellSize }]}>
          {currentLevelData.layout.flat().map((cell, index) => {
              const r = Math.floor(index / gridSize);
              const c = index % gridSize;
              const isPlayer = playerPos.row === r && playerPos.col === c;
              const isGoal = goalPos.row === r && goalPos.col === c;
              return (
                <View key={`${r}-${c}`} style={[styles.cell, { width: cellSize, height: cellSize }]}>
                  {cell === 1 && <View style={styles.wall} />}
                  {cell === 2 && (
                    <View style={styles.hazard}>
                        <Feather name="alert-triangle" size={cellSize * 0.5} color={COLORS.hazardIcon} />
                    </View>
                  )}
                  {isPlayer && <View style={[styles.player, isLiferActive && styles.playerShielded]} />}
                  {isGoal && <Feather name="feather" size={cellSize * 0.6} color={COLORS.primary} />}
                </View>
              );
            })}
        </View>
      </GestureDetector>

        <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>High Scores</Text>
            {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                <View key={idx} style={styles.leaderboardRow}>
                    <Text style={styles.leaderboardText}>{idx + 1}. {entry.name}</Text>
                    <Text style={[styles.leaderboardText, {fontWeight: 'bold'}]}>{entry.score}</Text>
                </View>
            )) : <Text style={styles.noScoresText}>No high scores yet!</Text>}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
    header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    headerButton: { backgroundColor: COLORS.card, padding: 10, borderRadius: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '90%',
        marginVertical: 20,
        backgroundColor: COLORS.card,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 15,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    statBox: { alignItems: 'center', justifyContent: 'center', padding: 10, minWidth: 60, },
    statLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '500' },
    statValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
    liferButton: { 
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    disabledLifer: {
        opacity: 0.5,
    },
    liferActive: {
        backgroundColor: COLORS.shield,
        borderColor: COLORS.shield,
    },
    gridContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cell: { justifyContent: 'center', alignItems: 'center' },
    wall: { width: '100%', height: '100%', backgroundColor: COLORS.wall, borderRadius: 2 },
    hazard: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.hazard,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    player: {
        width: '60%',
        height: '60%',
        backgroundColor: COLORS.player,
        borderRadius: 999,
        shadowColor: COLORS.player,
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 10,
    },
    playerShielded: {
        shadowColor: COLORS.shield,
        shadowRadius: 15,
    },
    leaderboardContainer: { 
        width: '90%', 
        marginTop: 'auto', 
        marginBottom: 20, 
        backgroundColor: COLORS.card, 
        padding: 20, 
        borderRadius: 15,
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
    noScoresText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 20,
        textAlign: 'center',
    },
});

export default WillowispMaze;