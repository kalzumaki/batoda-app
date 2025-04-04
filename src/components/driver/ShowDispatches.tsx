import React, {useEffect, useState, useRef} from 'react';
import {get} from '../../utils/proxy';
import {DispatchResponse, Dispatch} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import {API_URL} from '@env';

const ShowDispatches: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>(
    '../../assets/25.png',
  );
  const authenticatedUser = useRef<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token fetched from Show Dispatches');
          return;
        }

        console.log('User Token from Show Dispatches:', token);
        const response = await get(API_ENDPOINTS.USERS_TOKEN);
        authenticatedUser.current = response.data;

        if (response.data?.profile) {
          setProfileImage(`${API_URL}storage/${response.data.profile}`);
        }
      } catch (error) {
        console.error('Error fetching authenticated user:', error);
      }
    };

    const fetchDispatch = async () => {
      setLoading(true);
      try {
        const response: DispatchResponse = await get(
          API_ENDPOINTS.APPROVED_DISPATCH,
        );
        console.log('Dispatch Response:', response);

        if (response?.dispatches?.length) {
          setDispatch(response.dispatches[0]);
        } else {
          setDispatch(null);
          setMessage(response?.message ?? 'No Approved Dispatches Yet');
        }
      } catch (error) {
        console.error('Failed to fetch dispatch:', error);
        setMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load dispatch data.',
        );
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    fetchDispatch();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d5554" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!dispatch) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.dispatchingNow}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DispatchItem item={dispatch} />
    </ScrollView>
  );
};

const DispatchItem: React.FC<{item: Dispatch}> = ({item}) => {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(item.scheduled_dispatch_time),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(item.scheduled_dispatch_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [item.scheduled_dispatch_time]);

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
    <View style={styles.card}>
      <Text style={styles.dispatchingNow}>Dispatching Now</Text>
      <View style={styles.profileContainer}>
        <Image
          source={
            item.driver.profile
              ? {uri: `${API_URL}storage/${item.driver.profile}`}
              : require('../../assets/25.png')
          }
          style={styles.profilePic}
        />
        <View style={styles.driverDetails}>
          <Text
            style={
              styles.profileName
            }>{`${item.driver.fname} ${item.driver.lname}`}</Text>
          <Text style={styles.profileRole}>Driver</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>
          Today: <Text style={styles.value}>{getCurrentDate()}</Text>
        </Text>
        <Text style={styles.label}>
          Tricycle Number:{' '}
          <Text style={styles.value}>{item.tricycle.tricycle_number}</Text>
        </Text>
        <Text style={styles.label}>
          Scheduled Dispatch Time: <Text style={styles.value}>{timeLeft}</Text>
        </Text>
        <Text style={styles.label}>
          Dispatched By:{' '}
          <Text
            style={
              styles.value
            }>{`${item.dispatcher.fname} ${item.dispatcher.lname}`}</Text>
        </Text>
      </View>
    </View>
  );
};

const calculateTimeLeft = (scheduledTime: string) => {
  const now = Date.now();
  const dispatchTime = new Date(scheduledTime).getTime();
  const difference = dispatchTime - now;
  return difference > 0
    ? new Date(difference).toISOString().substr(14, 5)
    : '00:00';
};

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: 16},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: '#3d5554'},
  card: {
    backgroundColor: '#469c8f',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    minHeight: 250, // Adjust based on your UI preference
    justifyContent: 'center',
    alignItems: 'center',
  },

  dispatchingNow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3d5554',
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverDetails: {flex: 1},
  profileName: {fontSize: 18, fontWeight: 'bold', color: 'white'},
  profileRole: {fontSize: 14, color: '#c6d9d7'},
  infoContainer: {marginTop: 12},
  label: {fontSize: 16, color: 'white', fontWeight: '500', marginBottom: 6},
  value: {fontSize: 16, color: 'white', fontWeight: 'bold'},
});

export default ShowDispatches;
