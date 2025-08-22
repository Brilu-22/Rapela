import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUserData } from '../hooks/useUserData';
import { Feather } from '@expo/vector-icons';


const COLORS = {
  background: '#F0F2F5',
  primary: '#4E6813',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  shadow: '#D1D5DB',
  accent: '#ECFDF5',
  recordActive: '#1D6517',
};

const CLOUDINARY_CLOUD_NAME = 'dvxrzb6ok';
const CLOUDINARY_UPLOAD_PRESET = 'Memories';

const VideoDiaryScreen = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user } = useAuth();
  const { updateUserProgress } = useUserData();
  const router = useRouter();

  
  const swipeX = useSharedValue(0);

 
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const videoRecordPromise = cameraRef.current.recordAsync();
      if (videoRecordPromise) {
        const data = await videoRecordPromise;
        if (data && data.uri) {
          setVideoUri(data.uri);
        }
      }
    } catch (error) { console.error("Recording error:", error); Alert.alert("Recording Error", "Could not record video."); }
    finally { setIsRecording(false); }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  
  const handleSaveVideo = async () => {
    if (!videoUri || !user) return;
    setIsLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', { uri: videoUri, type: 'video/mp4', name: `diary-${user.uid}.mp4` } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) runOnJS(setUploadProgress)((event.loaded / event.total) * 100);
      };
      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const diariesRef = collection(db, "users", user.uid, "videoDiaries");
            await addDoc(diariesRef, {
              downloadURL: response.secure_url,
              createdAt: serverTimestamp(),
            });
            await updateUserProgress(25);
            setIsLoading(false);
            Alert.alert("Saved!", "Your video diary has been added.");
            router.replace('/diaryLog');
          } else {
            setIsLoading(false);
            Alert.alert("Upload Failed", `Cloudinary Error: ${xhr.responseText}`);
          }
        }
      };
      xhr.send(formData);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };
  
  
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isRecording && event.translationX > 0 && event.translationX < 120) {
        swipeX.value = event.translationX;
      } else if (isRecording && event.translationX < 0 && event.translationX > -120) {
        swipeX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const { translationX } = event;
      if (!isRecording && translationX > 80) {
        runOnJS(startRecording)();
      } else if (isRecording && translationX < -80) {
        runOnJS(stopRecording)();
      }
      swipeX.value = withSpring(0);
    });

  
  const animatedRecordButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value }],
  }));

  
  if (!cameraPermission || !micPermission) return <SafeAreaView style={styles.container}><ActivityIndicator color={COLORS.primary} /></SafeAreaView>;
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Dulce needs access to your camera and microphone.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={() => { requestCameraPermission(); requestMicPermission(); }}>
                    <Text style={styles.permissionButtonText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.cameraCard}>
            {videoUri ? (
            <Video source={{ uri: videoUri }} style={styles.videoPreview} useNativeControls resizeMode={ResizeMode.CONTAIN} />
            ) : (
            <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="video" />
            )}
        </View>
      
        <View style={styles.footer}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.uploadText}>Saving... {Math.round(uploadProgress)}%</Text>
                </View>
            ) : videoUri ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => setVideoUri(null)}>
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Record Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleSaveVideo}>
                        <Text style={styles.actionButtonText}>Save to Diary</Text>
                    </TouchableOpacity>
                </View>
            ) : (
               
                <View style={styles.gestureContainer}>
                    <Text style={[styles.instructionText, { right: '60%' }]}>Swipe Right to Record</Text>
                    <GestureDetector gesture={swipeGesture}>
                    <Animated.View style={[styles.recordButtonContainer, animatedRecordButtonStyle]}>
                        <View style={[styles.recordButton, isRecording && styles.recordButtonActive]} />
                    </Animated.View>
                    </GestureDetector>
                    <Text style={[styles.instructionText, { left: '60%' }]}>Swipe Left to Stop</Text>
                </View>
            )}
        </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background, 
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: COLORS.card,
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cameraCard: { 
        width: '90%', 
        aspectRatio: 9 / 16,
        backgroundColor: COLORS.card, 
        borderRadius: 30, 
        marginTop: 100,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10, 
        overflow: 'hidden'
    },
    camera: { flex: 1 },
    videoPreview: { flex: 1 },
    footer: { 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        height: 200, 
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    loadingContainer: { 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    uploadText: { 
        marginTop: 16, 
        color: COLORS.textSecondary, 
        fontSize: 16,
        fontWeight: '500'
    },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '90%' 
    },
    actionButton: { 
        backgroundColor: COLORS.primary, 
        paddingVertical: 18,
        borderRadius: 25, 
        alignItems: 'center', 
        flex: 1,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.shadow,
    },
    actionButtonText: { 
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: COLORS.textPrimary,
    },
    placeholderContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    placeholderText: { 
        fontSize: 18, 
        color: COLORS.textSecondary, 
        textAlign: 'center', 
        marginBottom: 20 
    },
    permissionButton: { 
        backgroundColor: COLORS.primary, 
        paddingVertical: 14, 
        paddingHorizontal: 30, 
        borderRadius: 30 
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    gestureContainer: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    recordButtonContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 40,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    recordButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 5,
        borderColor: COLORS.recordActive,
    },
    recordButtonActive: {
        borderRadius: 15, 
        backgroundColor: COLORS.recordActive,
    },
    instructionText: {
        position: 'absolute',
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        width: '40%',
        textAlign: 'center',
    },
});

export default VideoDiaryScreen;