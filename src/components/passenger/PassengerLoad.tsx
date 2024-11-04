import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';
import {get} from '../../utils/proxy';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import {DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';

const MAX_PASSENGERS = 6; 

const ApprovedDispatches: React.FC = () => {
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = new Animated.Value(1);

  const fetchPassengerCount = async () => {
    try {
      console.log('Fetching Passenger Count:');
      const data: DispatchResponse = await get(API_ENDPOINTS.PASSENGER_COUNT);
      console.log('Fetched Data:', JSON.stringify(data));

      if (data.dispatches && data.dispatches.length > 0) {
        setPassengerCount(data.dispatches[0].passenger_count);
        setError(null);
      } else {
        setPassengerCount(0); // Reset passenger count if no dispatches found
        console.log('No approved dispatches found.');
      }
    } catch (err) {
      console.error('Error fetching passenger count:', err);
      setError('Failed to fetch passenger count data.');
    }
  };

  useEffect(() => {
    fetchPassengerCount();

    const handleEvent = (event: any) => {
      console.log('Event received:', event);
      if (['DispatchUpdated', 'DispatchFinalized'].includes(event.eventName)) {
        console.log('Refreshing data due to event...');
        fetchPassengerCount();
      }
    };

    const subscribeToDispatches = async () => {
      await initPusher();
      await subscribeToChannel('dispatches', handleEvent);
    };

    subscribeToDispatches();

    return () => {
      console.log('Cleaning up Pusher subscription...');
      unsubscribeFromChannel('dispatches', handleEvent);
    };
  }, []);

  useEffect(() => {
    if (passengerCount === MAX_PASSENGERS) {
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
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [passengerCount]);

  const passengers = Array.from({length: MAX_PASSENGERS}, (_, index) => (
    <Animated.View
      key={index}
      style={[
        styles.iconContainer,
        index < passengerCount ? styles.filled : styles.empty,
        passengerCount === MAX_PASSENGERS
          ? {transform: [{scale: pulseAnim}]}
          : null,
      ]}>
      <Image
        source={require('../../assets/passenger.png')}
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
          <Text style={styles.passengerCount}>
            Passenger Count: {passengerCount}/{MAX_PASSENGERS}
          </Text>
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
    backgroundColor: '#c6d9d7',
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
