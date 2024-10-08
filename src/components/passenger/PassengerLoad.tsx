// components/PassengerLoad.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PassengerLoad: React.FC = () => {
  return (
    <View style={styles.passengerLoadContainer}>
      <Text style={styles.passengerLoadTitle}>Number of Passengers Load</Text>
      <View style={styles.passengerIcons}>
        {/* Icons representing passenger slots */}
        {[...Array(6)].map((_, index) => (
          <Image key={index} source={require('../../assets/passenger.png')} style={styles.icon} />
        ))}
      </View>
      <Text style={styles.passengerLoadCount}>1/6</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  passengerLoadContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  passengerLoadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c6d9d7',
  },
  passengerIcons: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  passengerLoadCount: {
    fontSize: 18,
    color: '#62a287',
  },
});

export default PassengerLoad;
