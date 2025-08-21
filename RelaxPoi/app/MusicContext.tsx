// context/MusicContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  playMusic: () => void;
  pauseMusic: () => void;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);

  useEffect(() => {
    loadAndPlayMusic();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAndPlayMusic = async () => {
    try {
      // Load music from local assets
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/music/Perfect.mp3'), // Update path if needed
        { shouldPlay: true, isLooping: true, volume }
      );
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to load music from assets', error);
      // You could add a fallback to a different local file if needed
    }
  };

  const playMusic = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const setVolume = async (newVolume: number) => {
    setVolumeState(newVolume);
    if (sound) {
      await sound.setVolumeAsync(newVolume);
    }
  };

  const value: MusicContextType = {
    isPlaying,
    volume,
    playMusic,
    pauseMusic,
    setVolume,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

// Export the hook
export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};