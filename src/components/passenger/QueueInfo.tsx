import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesomeIcon
import Toast from 'react-native-toast-message'; // Import your toast library
import { get } from '../../utils/proxy'; // Adjust path to your utility
import { Dispatch, DispatchResponse } from '../../types/approved-dispatch';

const DispatchQueue: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [noUpcomingQueue, setNoUpcomingQueue] = useState<boolean>(false);
  const [polling, setPolling] = useState<boolean>(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchDispatches = async () => {
    setPolling(true);
    try {
      const response: DispatchResponse = await get('/in-queue');
      if (response.status) {
        console.log('Fetched dispatches:', response.dispatches);
  
        // Filter out dispatched items
        const activeDispatches = response.dispatches.filter(
          (dispatch) => dispatch.is_dispatched !== 1
        );
  
        // Check if activeDispatches is empty
        if (activeDispatches.length > 0) {
          setDispatches(activeDispatches);
          setNoUpcomingQueue(false); // There are tricycles in the queue
        } else {
          setDispatches([]); // Clear the queue
          setNoUpcomingQueue(true); // No tricycles in queue
        }
  
      } else {
        setNoUpcomingQueue(true); // No tricycles in queue if response is invalid
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      setNoUpcomingQueue(true); // No tricycles in queue on error
    } finally {
      setPolling(false);
    }
  };
  
  useEffect(() => {
    fetchDispatches();
    pollingInterval.current = setInterval(fetchDispatches, 5000);
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const renderMinutesLeft = (scheduledTime: string) => {
    const timeLeft = Math.max(
      0,
      Math.ceil(
        (new Date(scheduledTime).getTime() - new Date().getTime()) / 60000,
      ),
    );
    return `${timeLeft} mins left`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tricycle Next in Queue</Text>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tricycle No.</Text>
        <Text style={styles.headerText}>Standby Time</Text>
      </View>

      {/* Polling message limited to ScrollView area */}
      <View style={styles.pollingContainer}>
        {polling && dispatches.length > 0 && (
          <Text style={styles.pollingText}>Updating queue...</Text>
        )}
      </View>

      <ScrollView>
        {/* Conditional rendering for dispatches */}
        {noUpcomingQueue ? (
          <Text style={styles.emptyText}>No tricycles in queue.</Text>
        ) : (
          dispatches.map((item) => (
            <View key={item.id} style={styles.dispatchItem}>
              <Text style={styles.tricycleNumber}>
                {item.tricycle.tricycle_number}
              </Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {renderMinutesLeft(item.scheduled_dispatch_time)}
                </Text>
                <TouchableOpacity>
                  <FontAwesomeIcon name="ellipsis-v" style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
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
  pollingContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#469c8f',
    borderRadius: 20,
    // marginBottom: 10,
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
    borderRadius: 25,
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
  icon: {
    fontSize: 30,
    color: '#2d665f',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#c6d9d7',
  },
  pollingText: {
    textAlign: 'center',
    color: '#ffffff',
    zIndex: 1
  },
});

export default DispatchQueue;
