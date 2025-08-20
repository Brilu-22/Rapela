import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Using Feather for a simple leaf icon

const COLORS = {
  background: 'rgba(16, 24, 40, 0.6)', // Semi-transparent dark background
  modalBg: '#F0FFF4',
  primaryText: '#2F855A',
  secondaryText: '#38A169',
  buttonBg: '#38A169',
  buttonText: '#FFFFFF',
};

interface StyledAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onConfirm: () => void;
}

const StyledAlert: React.FC<StyledAlertProps> = ({ visible, title, message, buttonText, onConfirm }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          {/* The Aesthetic Leaf Icon */}
          <View style={styles.iconContainer}>
            <Feather name="feather" size={32} color={COLORS.secondaryText} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>{buttonText}</Text>
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
    width: '85%',
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C6F6D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.buttonBg,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 15,
  },
  buttonText: {
    color: COLORS.buttonText,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StyledAlert;