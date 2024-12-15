import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ScanQRScreen = () => {
  // Add your logic here for QR scanning if needed

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.description}>
        Please scan the QR code to proceed with your ride reservation.
      </Text>
      <Button title="Start Scanning" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ScanQRScreen;
