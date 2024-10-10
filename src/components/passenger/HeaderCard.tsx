import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {get} from '../../utils/proxy'; // Adjust the path based on your project structure
import {useTimer} from '../../contexts/TimerContext';
import {Dispatch, DispatchResponse} from '../../types/approved-dispatch'; // Import the Dispatch interfaces
import Toast from 'react-native-toast-message';

const HeaderMain: React.FC = () => {
  const {timeLeft, setScheduledTime} = useTimer(); // Use TimerContext
  const [dispatchData, setDispatchData] = useState<Dispatch | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const TEN_MINUTES_IN_SECONDS = 600;

  const fetchDispatchData = async () => {
    try {
      const data: DispatchResponse = await get('/approved-dispatches');
      if (data && data.dispatches && data.dispatches.length > 0) {
        const newDispatch: Dispatch = data.dispatches[0];

        // Check if `is_dispatched` changed from 0 to 1 (from undispached to dispatched)
        if (
          dispatchData &&
          dispatchData.is_dispatched === 0 &&
          newDispatch.is_dispatched === 1
        ) {
          // Show toast if `is_dispatched` became 1
          Toast.show({
            type: 'success',
            text1: 'You are all set!',
            text2: 'Ready to go! Travel safe!',
            visibilityTime: 3000, // Duration of the toast (in ms)
          });
        }

        // Only update if dispatchData is different
        if (!dispatchData || newDispatch.id !== dispatchData.id) {
          setDispatchData(newDispatch);

          // Determine timer based on dispatch status
          if (
            newDispatch.is_dispatched === 1 ||
            newDispatch.actual_dispatch_time !== null
          ) {
            // Reset the scheduled time to null, displaying '-- -- --'
            setScheduledTime(null);
          } else {
            // Set the scheduled_dispatch_time in TimerContext
            setScheduledTime(newDispatch.scheduled_dispatch_time);
          }
        }
      } else {
        // No dispatch data, reset the scheduled time
        setDispatchData(null);
        setScheduledTime(null);
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
      setDispatchData(null);
      setScheduledTime(null);
    }
  };

  useEffect(() => {
    fetchDispatchData();
    pollingInterval.current = setInterval(fetchDispatchData, 5000);
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []); // Empty dependency array to prevent multiple intervals

  // Format timeLeft to display as "8 mins" or "-- -- --" if no data
  const formatTimeLeft = (seconds: number | null): string => {
    if (seconds === null) {
      return '-- -- --';
    }

    if (seconds === 0) {
      return '00:00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes} mins ${secs > 0 ? `${secs} sec` : ''}`;
  };

  // Format today's date
  const getCurrentDate = (): string => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Image
            source={require('../../assets/profile-user.png')}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../assets/menu.png')}
            style={styles.drawerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Dispatching Status */}
      <Text style={styles.statusText}>Dispatching Now...</Text>

      {/* Main Content: Driver Info, Tricycle Number, Date, Time Left */}
      <View style={styles.mainContent}>
        <View style={styles.tricycleContainer}>
          <Text style={styles.tricycleNumber}>
            {dispatchData ? dispatchData.tricycle.tricycle_number : '---'}
          </Text>
          <Text style={styles.tricycleLabel}>Tricycle Number</Text>

          <TouchableOpacity style={styles.reserveButton}>
            <Text style={styles.buttonText}>Reserve Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {/* Route Section - Always Displayed */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Route</Text>
            <Text style={styles.infoValue}>Dumaguete ➔</Text>
            <Text style={styles.infoValue}>Bacong</Text>
          </View>

          {/* Today's Date */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Today</Text>
            <Text style={styles.infoValue}>{getCurrentDate()}</Text>
          </View>

          {/* Time Left */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Time Left</Text>
            <Text style={styles.infoValue}>
              {dispatchData ? formatTimeLeft(timeLeft) : '-- -- --'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2d665f',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%',
    marginHorizontal: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  drawerIcon: {
    width: 30,
    height: 30,
  },
  statusText: {
    fontSize: 16,
    color: '#ffff',
    marginTop: 30,
    textAlign: 'left',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tricycleContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  tricycleNumber: {
    fontSize: 72,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tricycleLabel: {
    fontSize: 16,
    color: '#C6D9D7',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  driverLabel: {
    fontSize: 16,
    color: '#C6D9D7',
    marginBottom: 10,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  infoTextContainer: {
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    color: '#A8BAB7',
  },
  infoValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reserveButton: {
    backgroundColor: '#62a287', // Updated to the provided color code
    padding: 10,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF', // Ensures the text stands out on the button
    fontWeight: 'bold',
  },
  timeUnit: {
    fontSize: 12,
    color: '#A8BAB7',
    textAlign: 'center',
  },
});

export default HeaderMain;
