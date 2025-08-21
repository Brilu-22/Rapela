// app/musicControl.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMusic } from './MusicContext';

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
};

const MusicControlScreen = () => {
  const music = useMusic();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerName}>Sound Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Music Recorder-like Interface */}
        <View style={styles.card}>
          <View style={styles.recorderBody}>
            <View style={styles.recorderControls}>
              <TouchableOpacity 
                style={styles.playPauseButton}
                onPress={music.isPlaying ? music.pauseMusic : music.playMusic}
              >
                <Feather 
                  name={music.isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <View style={styles.volumeControl}>
                <Feather name="volume-1" size={24} color={COLORS.textSecondary} />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={music.volume}
                  onValueChange={music.setVolume}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.shadow}
                  thumbTintColor={COLORS.primary}
                />
                <Feather name="volume-2" size={24} color={COLORS.textSecondary} />
              </View>
            </View>
            
            {/* Visual indicators */}
            <View style={styles.indicators}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.indicator, 
                    { height: Math.random() * 30 + 10 }
                  ]} 
                />
              ))}
            </View>
            
            <View style={styles.additionalButtons}>
              <TouchableOpacity style={styles.recButton}>
                <View style={styles.recInnerCircle} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} />
            </View>
          </View>
        </View>

        <Text style={styles.status}>
          {music.isPlaying ? 'Music is playing' : 'Music is paused'}
        </Text>

        {/* Additional sound options */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Sound Options</Text>
          <TouchableOpacity style={styles.listItem}>
            <Feather name="music" size={22} color={COLORS.textSecondary} />
            <Text style={styles.listItemText}>Change Soundtrack</Text>
            <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Feather name="clock" size={22} color={COLORS.textSecondary} />
            <Text style={styles.listItemText}>Sleep Timer</Text>
            <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Feather name="settings" size={22} color={COLORS.textSecondary} />
            <Text style={styles.listItemText}>Sound Quality</Text>
            <Feather name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    paddingVertical: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  backButton: {
    padding: 5,
  },
  headerName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary, 
  },
  card: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    marginHorizontal: 20, 
    padding: 20, 
    shadowColor: COLORS.shadow, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  recorderBody: {
    alignItems: 'center',
  },
  recorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  playPauseButton: {
    backgroundColor: COLORS.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  slider: {
    width: '70%',
    height: 40,
    marginHorizontal: 10,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 50,
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  indicator: {
    width: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  additionalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  recButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContainer: { 
    marginHorizontal: 20, 
    marginTop: 40 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary, 
    marginBottom: 15 
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: { 
    flex: 1, 
    marginLeft: 15, 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textPrimary 
  },
});

export default MusicControlScreen;