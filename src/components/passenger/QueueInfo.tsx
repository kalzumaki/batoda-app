import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import {get} from '../../utils/proxy';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import {Dispatch, DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';

const DispatchQueue: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [noUpcomingQueue, setNoUpcomingQueue] = useState<boolean>(false);
  const [minutesLeft, setMinutesLeft] = useState<{[id: number]: number}>({});

  const fetchDispatches = async () => {
    try {
      const response: DispatchResponse = await get(API_ENDPOINTS.IN_QUEUE);
      if (response.status) {
        console.log('Fetched dispatches:', response.dispatches);

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
      console.log('Received event:', event);
      if (
        event.eventName === 'DispatchUpdated' ||
        event.eventName === 'DispatchFinalized'
      ) {
        console.log('Refreshing data due to event...');
        fetchDispatches();
      }
    };

    const subscribeToDispatches = async () => {
      await initPusher();
      await subscribeToChannel('dispatches', handleEvent);
    };

    subscribeToDispatches();

    return () => {
      console.log('Unsubscribing from Pusher...');
      unsubscribeFromChannel('dispatches', handleEvent);
    };
  }, []);

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
            <TouchableOpacity key={item.id}>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 2,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  tricycleNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d665f',
    // color: 'black',
    marginLeft: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#2d665f',
    // color: 'black',
    marginRight: 10,
  },
  icon: {
    fontSize: 30,
    color: '#2d665f',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    color: '#c6d9d7',
  },
});

export default DispatchQueue;
