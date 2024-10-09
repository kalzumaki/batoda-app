import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { get } from '../../utils/proxy';
import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';

const pusher = Pusher.getInstance();

const HeaderMain: React.FC = () => {
  const [dispatchData, setDispatchData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0); // Start with 0 until dispatch data is available

  
  // Function to fetch initial dispatch data
  const fetchDispatchData = async () => {
    try {
      const data = await get('/approved-dispatches');
      if (data && data.dispatches && data.dispatches.length > 0) {
        setDispatchData(data.dispatches[0]);
        setTimeLeft(600); // Set initial time left to 10 minutes
      } else {
        console.log('No dispatch data available.');
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
    }
  };

  // Format today's date
  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  // Countdown logic: decrease timeLeft every second
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && timer) {
      clearInterval(timer);
    }

    return () => clearInterval(timer); // Cleanup on unmount
  }, [timeLeft]);

  // Format timeLeft to display as hh:mm:ss
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes
      .toString()
      .padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchDispatchData();
  }, []);

  return (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Image source={require('../../assets/profile-user.png')} style={styles.profileIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../../assets/menu.png')} style={styles.drawerIcon} />
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
  timeUnit: {
    fontSize: 12,
    color: '#C6D9D7',
    marginTop: 5,
  },
  reserveButton: {
    backgroundColor: '#62a287',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 29,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HeaderMain;
