import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ReserveRideScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Reserve Your Ride</Text>
      <Button title="Book Now" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReserveRideScreen;
