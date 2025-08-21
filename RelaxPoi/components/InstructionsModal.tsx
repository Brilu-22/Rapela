// components/InstructionsModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const COLORS = {
  background: '#F0F2F5',
  primary: '#34D399',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

type Rule = {
  icon: React.ComponentProps<typeof Feather>['name'];
  text: string;
};

type InstructionsModalProps = {
  visible: boolean;
  title: string;
  rules: Rule[];
  buttonText: string;
  onClose: () => void;
};

export const InstructionsModal = ({ visible, title, rules, buttonText, onClose }: InstructionsModalProps) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.centeredView}>
        <Animated.View style={styles.modalView} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          {rules.map((rule, index) => (
            <View key={index} style={styles.ruleContainer}>
              <Feather name={rule.icon} size={24} color={COLORS.primary} style={styles.ruleIcon} />
              <Text style={styles.ruleText}>{rule.text}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 25,
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  ruleIcon: {
    marginRight: 15,
  },
  ruleText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});