// components/QueueInfo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QueueInfo: React.FC = () => {
  return (
    <View style={styles.queueContainer}>
      <Text style={styles.queueTitle}>Tricycle Next in Queue</Text>
      <View style={styles.queueInfo}>
        <Text style={styles.queueTricycle}>234</Text>
        <Text style={styles.queueStandbyTime}>10 mins left</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  queueContainer: {
    marginBottom: 20,
    backgroundColor: '#469c8f', // Queue background color
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c6d9d7',
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  queueTricycle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c6d9d7',
  },
  queueStandbyTime: {
    fontSize: 16,
    color: '#c6d9d7',
  },
});

export default QueueInfo;
