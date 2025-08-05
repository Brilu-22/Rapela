// app/videoDiary.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';

const VideoDiaryScreen = () => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Request permission when the component mounts
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Diary</Text>
      {videoUri ? (
        <>
          <Video
            source={{ uri: videoUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
          <TouchableOpacity style={styles.button} onPress={() => setVideoUri(null)}>
            <Text style={styles.buttonText}>Choose a different video</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Select a video from your library to add to your diary.</Text>
            <Button title="Select Video" onPress={pickVideo} color="#A5D6A7"/>
        </View>
      )}
       <TouchableOpacity style={[styles.button, {backgroundColor: '#388E3C'}]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#388E3C', marginBottom: 30 },
    video: { width: 320, height: 240, marginBottom: 20, backgroundColor: '#E8F5E9' },
    placeholder: { alignItems: 'center', marginVertical: 40, paddingHorizontal: 20 },
    placeholderText: { fontSize: 16, color: '#388E3C', textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: '#A5D6A7', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, marginTop: 20 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default VideoDiaryScreen;