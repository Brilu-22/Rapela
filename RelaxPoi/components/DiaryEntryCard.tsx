import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


const COLORS = {
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  primary: '#253528', 
};

type DiaryEntry = {
  id: string;
  downloadURL: string;
  createdAt: Timestamp;
};

type DiaryEntryCardProps = {
  entry: DiaryEntry;
};

export const DiaryEntryCard = ({ entry }: DiaryEntryCardProps) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const generateThumbnail = async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(
          entry.downloadURL,
          { time: 1000 }
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

  const formattedDate = entry.createdAt ? format(entry.createdAt.toDate(), 'MMMM d, yyyy') : 'Loading date...';

  return (
    <View style={styles.card}>
      <View style={styles.thumbnailContainer}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <ActivityIndicator color={COLORS.primary} />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.subtitle}>Video Diary Entry</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});