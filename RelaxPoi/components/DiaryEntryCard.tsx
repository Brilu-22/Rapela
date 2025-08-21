

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { format } from 'date-fns';

const COLORS = { text: '#2D3748', textLight: '#718096', cardBorder: '#E2E8F0' };

type DiaryEntryCardProps = {
  entry: {
    downloadURL: string;
    createdAt: {
      toDate: () => Date;
    };
  };
};

export const DiaryEntryCard = ({ entry }: DiaryEntryCardProps) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const generateThumbnail = async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(
          entry.downloadURL,
          { time: 1000 } // Get thumbnail from the 1-second mark
        );
        if (isMounted) {
          setThumbnailUri(uri);
        }
      } catch (e) {
        console.warn('Could not generate thumbnail', e);
      }
    };
    generateThumbnail();
    return () => { isMounted = false; };
  }, [entry.downloadURL]);

  const formattedDate = entry.createdAt ? format(entry.createdAt.toDate(), 'MMMM d, yyyy') : '...';

  return (
    <View style={styles.container}>
      <View style={styles.cardStack}>
        {thumbnailUri ? (
          <>
            {/* Background Card 1 (left) */}
            <Image source={{ uri: thumbnailUri }} style={[styles.card, styles.cardBehind, styles.cardLeft]} />
            {/* Background Card 2 (right) */}
            <Image source={{ uri: thumbnailUri }} style={[styles.card, styles.cardBehind, styles.cardRight]} />
            {/* Foreground Card */}
            <Image source={{ uri: thumbnailUri }} style={[styles.card, styles.cardFront]} />
          </>
        ) : (
          <ActivityIndicator style={styles.loader} />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.description}>Today's Video Diary Entry</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 40 },
  cardStack: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  card: { width: 180, height: 180, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardFront: { zIndex: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15 },
  cardBehind: { position: 'absolute', zIndex: 1 },
  cardLeft: { transform: [{ rotate: '-8deg' }, { translateX: -30 }] },
  cardRight: { transform: [{ rotate: '8deg' }, { translateX: 30 }] },
  loader: { position: 'absolute' },
  infoContainer: { marginTop: 20, alignItems: 'center' },
  dateText: { backgroundColor: '#E2E8F0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, overflow: 'hidden', color: COLORS.textLight, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 16, color: COLORS.text, textAlign: 'center' },
});