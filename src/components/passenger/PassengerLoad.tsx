// Import necessary functions
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { get } from '../../utils/proxy'; // Assuming the proxy.ts file is in the utils folder

const ApprovedDispatches: React.FC = () => {
  const [passengerCount, setPassengerCount] = useState<number>(0); // Initializing with 0 passengers
  const [error, setError] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1)); // For special effects when 6 passengers

  useEffect(() => {
    const fetchApprovedDispatches = async () => {
      try {
        const response = await get('/passenger-count');

        // Assuming the response contains a "dispatches" array
        if (response && response.dispatches && response.dispatches.length > 0) {
          setPassengerCount(response.dispatches[0].passenger_count); // Set passenger_count based on response
        } else {
          setError('No approved dispatches found.');
        }
      } catch (err) {
        setError('Failed to fetch data.');
        console.error('Error fetching approved dispatches:', err);
      }
    };

    // Fetching data every 3 seconds (polling)
    const interval = setInterval(() => {
      fetchApprovedDispatches();
    }, 3000); // Changed to 3 seconds

    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, []);

  // Special effect (pulsing animation) when passenger count reaches 6
  useEffect(() => {
    if (passengerCount === 6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1); // Reset pulse effect if not full
    }
  }, [passengerCount]);

  // Generate array for displaying passenger icons based on passengerCount
  const passengers = [...Array(6)].map((_, index) => (
    <Animated.View
      key={index}
      style={[
        styles.iconContainer,
        index < passengerCount ? styles.filled : styles.empty,
        passengerCount === 6 ? { transform: [{ scale: pulseAnim }] } : null, // Apply pulsing effect if full
      ]}
    >
      <Image
        source={require('../../assets/passenger.png')} // Passenger icon
        style={styles.icon}
      />
    </Animated.View>
  ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Count</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.passengerIcons}>{passengers}</View>
          <Text style={styles.passengerCount}>Passenger Count: {passengerCount}/6</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#469c8f',
    marginBottom: 10,
  },
  passengerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 5,
  },
  filled: {
    backgroundColor: '#62a287', 
  },
  empty: {
    backgroundColor: '#c6d9d7', // Light gray background for empty slots
  },
  icon: {
    width: 40,
    height: 40,
  },
  passengerCount: {
    fontSize: 20,
    color: '#2d665f',
    textAlign: 'center',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ApprovedDispatches;
