import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; // We'll use this for the leaf icon

const COLORS = {
  background: 'rgba(16, 24, 40, 0.6)',
  modalBg: '#F0FFF4',
  primaryText: '#2F855A',
  secondaryText: '#38A169',
  leafBase: '#A0AEC0', // Color for unselected leaves
  leafSelected: '#48BB78', // Bright green for selected leaf
};

interface MoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMood: (rating: number) => void; // Function to save the rating (1, 2, or 3)
}

const MoodModal: React.FC<MoodModalProps> = ({ visible, onClose, onSaveMood }) => {
  const ratings = [1, 2, 3, 4, 5]; // Let's do a 5-leaf rating system

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>How do you rate your day?</Text>
          
          <View style={styles.leavesContainer}>
            {ratings.map((rating) => (
              <TouchableOpacity key={rating} onPress={() => onSaveMood(rating)}>
                <Feather name="feather" size={36} color={COLORS.leafSelected} style={styles.leaf} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.modalBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primaryText,
    marginBottom: 24,
  },
  leavesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  leaf: {
    opacity: 0.8, // Give it a softer look
  },
  skipText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textDecorationLine: 'underline',
  },
});

export default MoodModal;