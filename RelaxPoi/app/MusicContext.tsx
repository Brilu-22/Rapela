import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Audio } from 'expo-av';


export type Track = {
  id: string;
  url: any; 
  title: string;
  artist: string;
  artwork: any; 
};


export const TRACKS: Track[] = [
  {
    id: '1',
    url: require('../assets/music/Calm2.mp3'),
    title: 'Peaceful Mind',
    artist: 'Dulce',
    artwork: require('../assets/images/Calm3.png'),
  },
  {
    id: '2',
    url: require('../assets/music/HipHop.mp3'),
    title: 'Lofi Focus',
    artist: 'Dulce',
    artwork: require('../assets/images/Kanye3.png'),
  },
  {
    id: '3',
    url: require('../assets/music/Kwest.mp3'),
    title: 'Forest Creek',
    artist: 'Nature',
    artwork: require('../assets/images/Kwesta.png'),
  },
  {
    id: '4',
    url: require('../assets/music/R&B.mp3'),
    title: 'Evening Vibe',
    artist: 'Dulce',
    artwork: require('../assets/images/R&B.png'), 
  },
  {
    id: '5',
    url: require('../assets/music/Vibe.mp3'),
    title: 'Morning Sun',
    artist: 'Dulce',
    artwork: require('../assets/images/Vibes.png'), 
  },
];


interface MusicContextType {
  isInitialized: boolean;
  isPlaying: boolean;
  volume: number;
  currentTrack: Track | null;
  playTrack: (trackIndex: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (newVolume: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {

  const soundRef = useRef<Audio.Sound | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);

  
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true, 
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    }).then(() => setIsInitialized(true));

    
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []); 

  const playTrack = async (trackIndex: number) => {
    
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (trackIndex < 0 || trackIndex >= TRACKS.length) {
      setIsPlaying(false);
      setCurrentTrackIndex(null);
      return;
    }

    try {
      const track = TRACKS[trackIndex];
      const { sound } = await Audio.Sound.createAsync(
        track.url,
        { shouldPlay: true, isLooping: true, volume },
      );
      soundRef.current = sound;
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
    } catch (error) {
      console.error(`Error loading track ${trackIndex}:`, error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
        
        await playTrack(0);
        return;
    }
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    let nextIndex = (currentTrackIndex ?? -1) + 1;
    if (nextIndex >= TRACKS.length) {
      nextIndex = 0; 
    }
    playTrack(nextIndex);
  };

  const prevTrack = () => {
    let prevIndex = (currentTrackIndex ?? 0) - 1;
    if (prevIndex < 0) {
      prevIndex = TRACKS.length - 1; 
    }
    playTrack(prevIndex);
  };

  const setVolume = async (newVolume: number) => {
    setVolumeState(newVolume);
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(newVolume);
    }
  };

  const value: MusicContextType = {
    isInitialized,
    isPlaying,
    volume,
    currentTrack: currentTrackIndex !== null ? TRACKS[currentTrackIndex] : null,
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    setVolume,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};