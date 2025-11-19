import React from 'react';
import { 
    Modal, 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
    overlay: 'rgba(0, 0, 0, 0.6)',
    background: '#FFFFFF',
    primary: '#4E6813',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
};

interface MoodModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveMood: (rating: number) => void;
}

const MoodModal: React.FC<MoodModalProps> = ({ 
    visible, 
    onClose, 
    onSaveMood 
}) => {
    console.log('MoodModal rendered - visible:', visible);

    const moodOptions = [
        { rating: 1, emoji: '😢', label: 'Very Bad' },
        { rating: 2, emoji: '😕', label: 'Bad' },
        { rating: 3, emoji: '😐', label: 'Neutral' },
        { rating: 4, emoji: '😊', label: 'Good' },
        { rating: 5, emoji: '😄', label: 'Very Good' },
    ];

    const handleMoodSelect = (rating: number) => {
        console.log('Mood selected:', rating);
        onSaveMood(rating);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>How are you feeling?</Text>
                        <Text style={styles.subtitle}>
                            Rate your mood after journaling
                        </Text>
                    </View>

                    {/* Mood Options */}
                    <View style={styles.moodContainer}>
                        {moodOptions.map((mood) => (
                            <TouchableOpacity
                                key={mood.rating}
                                style={styles.moodOption}
                                onPress={() => handleMoodSelect(mood.rating)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.moodEmoji}>
                                    {mood.emoji}
                                </Text>
                                <Text style={styles.moodLabel}>
                                    {mood.label}
                                </Text>
                                <View style={styles.ratingCircle}>
                                    <Text style={styles.ratingText}>
                                        {mood.rating}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Skip Button */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>
                            Skip for now
                        </Text>
                    </TouchableOpacity>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Feather name="x" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        ...Platform.select({
            web: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            },
        }),
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    moodContainer: {
        marginBottom: 24,
    },
    moodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    moodEmoji: {
        fontSize: 24,
        marginRight: 16,
        width: 32,
    },
    moodLabel: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    ratingCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    skipText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
});

export default MoodModal;