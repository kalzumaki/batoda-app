import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {get} from '../../utils/proxy';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';

import {Dispatch, DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';

const DispatchQueue: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [noUpcomingQueue, setNoUpcomingQueue] = useState<boolean>(false);
  const [minutesLeft, setMinutesLeft] = useState<{[id: number]: number}>({});
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchDispatches = async () => {
    try {
      const response: DispatchResponse = await get(API_ENDPOINTS.IN_QUEUE);
      if (response.status) {
        const activeDispatches = response.dispatches.filter(
          dispatch => dispatch.is_dispatched !== 1,
        );

        const initialMinutesLeft = activeDispatches.reduce((acc, dispatch) => {
          const scheduledTimeMs = new Date(
            dispatch.scheduled_dispatch_time,
          ).getTime();
          const currentTimeMs = new Date().getTime();
          acc[dispatch.id] = Math.max(
            0,
            Math.ceil((scheduledTimeMs - currentTimeMs) / 60000),
          );
          return acc;
        }, {} as {[id: number]: number});

        setMinutesLeft(initialMinutesLeft);

        if (activeDispatches.length > 0) {
          setDispatches(activeDispatches);
          setNoUpcomingQueue(false);
        } else {
          setDispatches([]);
          setNoUpcomingQueue(true);
        }
      } else {
        setNoUpcomingQueue(true);
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch dispatch queue.',
      });
      setNoUpcomingQueue(true);
    }
  };

  useEffect(() => {
    fetchDispatches();

    const handleEvent = (event: PusherEvent) => {
      if (
        event.eventName === 'DispatchUpdated' ||
        event.eventName === 'DispatchFinalized'
      ) {
        fetchDispatches();
      }
    };

    const subscribeToDispatches = async () => {
      await initPusher();
      await subscribeToChannel('dispatches', handleEvent);
    };

    subscribeToDispatches();

    return () => {
      unsubscribeFromChannel('dispatches', handleEvent);
    };
  }, [refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft(prevMinutesLeft => {
        const updatedMinutesLeft = {...prevMinutesLeft};
        Object.keys(updatedMinutesLeft).forEach(id => {
          updatedMinutesLeft[parseInt(id)] = Math.max(
            0,
            updatedMinutesLeft[parseInt(id)] - 1,
          );
        });
        return updatedMinutesLeft;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatches]);

  const handlePress = (dispatch: Dispatch) => {
    console.log('Navigating to ReserveRide with:', {
      dispatchId: dispatch.id,
      tricycleNumber: dispatch.tricycle.tricycle_number,
    });
    navigation.navigate('ReserveRide', {
      dispatchId: dispatch.id,
      tricycleNumber: dispatch.tricycle.tricycle_number,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tricycle Next in Queue</Text>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tricycle No.</Text>
        <Text style={styles.headerText}>Standby Time</Text>
      </View>
      <ScrollView>
        {noUpcomingQueue ? (
          <Text style={styles.emptyText}>No tricycles in queue.</Text>
        ) : (
          dispatches.map(item => (
            <TouchableOpacity key={item.id} onPress={() => handlePress(item)}>
              <View style={styles.dispatchItem}>
                <Text style={styles.tricycleNumber}>
                  {item.tricycle.tricycle_number}
                </Text>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {minutesLeft[item.id] !== undefined
                      ? `${minutesLeft[item.id]} mins left`
                      : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    textAlign: 'left',
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#469c8f',
    borderRadius: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dispatchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#c6d9d7',
    borderRadius: 10,
    marginBottom: 10,
  },
  tricycleNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d665f',
    marginLeft: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#2d665f',
    marginRight: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    color: '#c6d9d7',
  },
});

export default DispatchQueue;
