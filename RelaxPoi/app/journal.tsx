import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, 
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator, 
    TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useActivityTracker } from '../hooks/useActivityTracker';
import MoodModal from '../components/MoodModal'; 
import { Feather } from '@expo/vector-icons';
import { useUserData } from '../hooks/useUserData'; 

const COLORS = {
    background: '#F0F2F5',
    primary: '#4E6813',
    card: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    shadow: '#D1D5DB',
};

const JournalScreen = () => {
    const [entry, setEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const { user } = useAuth();
    const { updateUserProgress, saveMoodRating } = useUserData(); 
    const router = useRouter();
    
    useActivityTracker('journal'); 

    const handleSave = async () => {
        console.log('Save button pressed');
        
        if (!user) {
            Alert.alert("Login Required", "You must be logged in to save entries.");
            return;
        }
        
        if (entry.trim() === '') {
            Alert.alert("Empty Entry", "Please write something before saving.");
            return;
        }

        setIsLoading(true);
        
        try {
            console.log('Saving to Firestore...');
            
            // Save journal entry
            const entriesCollectionRef = collection(db, "users", user.uid, "entries");
            await addDoc(entriesCollectionRef, {
                content: entry,
                createdAt: serverTimestamp(),
            });
            
            console.log('Journal entry saved successfully');
            
            // Update user progress
            await updateUserProgress(25); 
            console.log('User progress updated');
            
            // Show mood modal
            console.log('Setting modal visible to true');
            setIsModalVisible(true);
            
        } catch (error) {
            console.error("Error saving entry:", error);
            Alert.alert("Error", "Could not save your entry. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMood = async (rating: number) => {
        console.log('Saving mood rating:', rating);
        
        try {
            await saveMoodRating(rating); 
            console.log('Mood rating saved');
            
            Alert.alert("Thank You!", "Your mood has been logged.", [
                { 
                    text: 'OK', 
                    onPress: () => {
                        setIsModalVisible(false);
                        setEntry('');
                        router.back();
                    }
                }
            ]);
            
        } catch (error) {
            console.error('Error saving mood:', error);
            Alert.alert("Error", "Could not save your mood rating.");
        }
    };

    const handleCloseModal = () => {
        console.log('Closing modal');
        setIsModalVisible(false);
        setEntry('');
        router.back();
    };

    return (
        <>
            <MoodModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onSaveMood={handleSaveMood}
            />
            
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity 
                                    style={styles.headerButton} 
                                    onPress={() => router.back()}
                                >
                                    <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
                                </TouchableOpacity>
                                
                                <Text style={styles.title}>New Journal Entry</Text>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.headerButton, 
                                        isLoading && styles.disabledButton
                                    ]} 
                                    onPress={handleSave} 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <Feather name="check" size={24} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Journal Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    multiline
                                    placeholder="What's on your mind? Write your thoughts here..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={entry}
                                    onChangeText={setEntry}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Debug Button - Remove in production */}
                            <TouchableOpacity 
                                style={styles.debugButton}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Text style={styles.debugButtonText}>Debug: Show Modal</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        opacity: 0.5,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.textPrimary,
        textAlignVertical: 'top',
    },
    debugButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    debugButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default JournalScreen;