import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { get } from '../../utils/proxy'; // Adjust the path based on your project structure
import { useTimer } from '../../contexts/TimerContext'; 
interface Dispatch {
  id: number; // Unique identifier for the dispatch
  tricycle: {
    tricycle_number: string;
  };
  // Add other dispatch properties if needed
}

const HeaderMain: React.FC = () => {
  const { timeLeft, resetTimer, startTimer } = useTimer(); // Get timer values from context
  const [dispatchData, setDispatchData] = useState<Dispatch | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchDispatchData = async () => {
    try {
      const data = await get('/approved-dispatches');
      if (data && data.dispatches && data.dispatches.length > 0) {
        const newDispatch = data.dispatches[0];
        if (!dispatchData || newDispatch.id !== dispatchData.id) {
          setDispatchData(newDispatch);
          resetTimer(); // Reset timer when new dispatch data arrives
          startTimer(); // Start the timer
        }
      } else {
        if (dispatchData !== null) {
          setDispatchData(null);
        }
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
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
  }, [dispatchData]);

  // Format timeLeft to display as hh:mm:ss
  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes
      .toString()
      .padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
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

      {/* Main Content: Tricycle Number, Date, Route, Time */}
      <View style={styles.mainContent}>
        <View style={styles.tricycleContainer}>
          <Text style={styles.tricycleNumber}>
            {dispatchData ? dispatchData.tricycle.tricycle_number : '---'}
          </Text>
          <Text style={styles.tricycleLabel}>Tricycle Number</Text>

          {/* Button below the tricycle number */}
          <TouchableOpacity style={styles.reserveButton}>
            <Text style={styles.buttonText}>Reserve Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Today</Text>
            <Text style={styles.infoValue}>{getCurrentDate()}</Text>
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Route</Text>
            <Text style={styles.infoValue}>Dumaguete ➔</Text>
            <Text style={styles.infoValue}>Bacong</Text>
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Time Left</Text>
            <Text style={styles.infoValue}>{formatTimeLeft(timeLeft)}</Text>
            <Text style={styles.timeUnit}>hr     min     sec</Text>
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
    fontSize: 18,
    color: '#C6D9D7',
    marginTop: 30,
    textAlign: 'center',
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
    backgroundColor: '#FFCC00',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#2d665f',
    fontWeight: 'bold',
  },
  timeUnit: {
    fontSize: 12,
    color: '#A8BAB7',
    textAlign: 'center',
  },
});

export default HeaderMain;
