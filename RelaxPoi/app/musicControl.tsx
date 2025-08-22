import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { useMusic, TRACKS, Track } from './MusicContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F0F2F5',
  primary: '#4E6813',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
};

const MusicControlScreen = () => {
  const { isInitialized, isPlaying, volume, currentTrack, togglePlayPause, nextTrack, prevTrack, setVolume, playTrack } = useMusic();
  const router = useRouter();

  if (!isInitialized) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 15, color: COLORS.textSecondary, fontSize: 16 }}>Initializing Player...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerName}>Sound Player</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.playerCard}>
            <View style={styles.artworkContainer}>
                <Image 
                    
                    source={currentTrack ? currentTrack.artwork : require('../assets/images/Vibes.png')} 
                    style={styles.artwork}
                />
            </View>
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{currentTrack?.title || 'No Track Playing'}</Text>
                <Text style={styles.trackArtist}>{currentTrack?.artist || 'Select a track to begin'}</Text>
            </View>
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={prevTrack} style={styles.controlButton}>
                    <Feather name="skip-back" size={32} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                    <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
                    <Feather name="skip-forward" size={32} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>
            <View style={styles.volumeControl}>
                <Feather name="volume-1" size={24} color={COLORS.textSecondary} />
                <Slider
                    style={styles.slider}
                    minimumValue={0} maximumValue={1} value={volume} onValueChange={setVolume}
                    minimumTrackTintColor={COLORS.primary} maximumTrackTintColor={COLORS.shadow} thumbTintColor={COLORS.primary}
                />
                <Feather name="volume-2" size={24} color={COLORS.textSecondary} />
            </View>
        </View>
        
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Sound Library</Text>
         
          {TRACKS.map((track: Track, index: number) => (
            <TouchableOpacity key={track.id} style={styles.listItem} onPress={() => playTrack(index)}>
                <Image source={track.artwork} style={styles.listItemArtwork} />
                <View style={styles.listItemTextContainer}>
                    <Text style={[styles.listItemTitle, currentTrack?.id === track.id && { color: COLORS.primary }]}>
                        {track.title}
                    </Text>
                    <Text style={styles.listItemArtist}>{track.artist}</Text>
                </View>
                {currentTrack?.id === track.id && isPlaying && <Feather name="bar-chart-2" size={22} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
    scrollContent: { paddingVertical: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backButton: { backgroundColor: COLORS.card, padding: 10, borderRadius: 20 },
    headerName: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    playerCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, padding: 25, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignItems: 'center' },
    artworkContainer: { width: width * 0.6, height: width * 0.6, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10, marginBottom: 25 },
    artwork: { width: '100%', height: '100%', borderRadius: 20 },
    trackInfo: { alignItems: 'center', marginBottom: 20 },
    trackTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center' },
    trackArtist: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
    controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '80%', marginBottom: 20 },
    controlButton: { padding: 10 },
    playPauseButton: { backgroundColor: COLORS.primary, width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
    volumeControl: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 10 },
    slider: { flex: 1, height: 40, marginHorizontal: 10 },
    listContainer: { marginHorizontal: 20, marginTop: 40 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 15 },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 15, borderRadius: 15, marginBottom: 10 },
    listItemArtwork: { width: 50, height: 50, borderRadius: 10 },
    listItemTextContainer: { flex: 1, marginLeft: 15 },
    listItemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    listItemArtist: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});

export default MusicControlScreen;