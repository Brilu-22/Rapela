// app/journal.tsx (and similar for app/game.tsx)
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const JournalScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      {/* You will add your swipeable journal UI here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#388E3C',
  },
});

export default JournalScreen;