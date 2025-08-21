import React from 'react';
import SplashScreen from './splashScreen';
import { MusicProvider } from './MusicContext';

export default function StartPage() {
  return (
    <MusicProvider>
      <SplashScreen />
    </MusicProvider>
  );
}