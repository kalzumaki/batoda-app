import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {get} from '../../utils/proxy';
import {useTimer} from '../../contexts/TimerContext';
import {Dispatch, DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDropdown from '../MenuDropdown';
import {
  RefreshTriggerProp,
  RootStackParamList,
} from '../../types/passenger-dashboard';
import {STORAGE_API_URL} from '@env';
import useSocketListener from '../../hooks/useSocketListener';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
const HeaderMain: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const {timeLeft, setScheduledTime} = useTimer();
  const [dispatchData, setDispatchData] = useState<Dispatch | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const navigation = useNavigation<NavigationProps>();
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        console.log('User Token from headercomponent: ', token);

        try {
          const response = await get(API_ENDPOINTS.USERS_TOKEN);
          const data = response.data;
          setAuthenticatedUser(data);
          //   console.log('data found in header component: ', data);

          if (data && data.profile) {
            const fullImageUrl = `${STORAGE_API_URL}/storage/${data.profile}`;
            console.log('Full profile image URL:', fullImageUrl);
            setProfileImage(fullImageUrl);
          } else {
            const fullName = `${data.fname} ${data.lname}`;
            const encodedName = encodeURIComponent(fullName);
            const imageUrl = `https://avatar.iran.liara.run/username?username=${encodedName}`;
            setProfileImage(imageUrl);
          }
        } catch (error) {
          console.error('Error fetching authenticated user:', error);
        }
      } else {
        console.log('No token fetched from headercomponent');
      }
    };

    checkAuth();
  }, []);

  const fetchInitialData = async () => {
    console.log('Starting fetchInitialData...');

    try {
      const data: DispatchResponse = await get(API_ENDPOINTS.APPROVED_DISPATCH);
      //   console.log('Fetched data:', JSON.stringify(data));

      if (data?.dispatches?.length) {
        const newDispatch: Dispatch = data.dispatches[0];

        // console.log(
        //   'Dispatcher Response Time:',
        //   newDispatch.dispatcher_response_time,
        //   'Scheduled Dispatch Time:',
        //   newDispatch.scheduled_dispatch_time,
        // );

        setDispatchData(newDispatch);
        setScheduledTime(
          newDispatch.dispatcher_response_time ?? '',
          newDispatch.scheduled_dispatch_time ?? '',
        );
      } else {
        setDispatchData(null);
        setScheduledTime('', '');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setDispatchData(null);
      setScheduledTime('', '');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [refreshTrigger]);

  const handleDispatchUpdated = useCallback((data: any) => {
    console.log('Dispatch updated:', data);
    fetchInitialData();
  }, []);

  const handleDispatchFinalized = useCallback((data: any) => {
    console.log('Dispatch finalized:', data);
    fetchInitialData();
  }, []);

  useSocketListener('dispatch-updated', handleDispatchUpdated);
  useSocketListener('dispatch-finalized', handleDispatchFinalized);

  const fetchUnreadNotif = async () => {
    try {
      const res = await get(API_ENDPOINTS.NOTIF_UNREAD_COUNT);
      if (res?.status && typeof res.unread === 'number') {
        setUnreadCount(res.unread);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  };
  useEffect(() => {
    fetchUnreadNotif();
  }, []);

  const handleNewNotification = useCallback((data: any) => {
    console.log('New notification received:', data);
    fetchUnreadNotif();
  }, []);

  useSocketListener('new-notification', handleNewNotification);
  useSocketListener('notifications-cleared', handleNewNotification);
  //   useEffect(() => {
  //     console.log('Current dispatchData:', JSON.stringify(dispatchData));
  //   }, [dispatchData]);

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
        <Image
          source={
            profileImage && profileImage.startsWith('http')
              ? {uri: profileImage}
              : require('../../assets/25.png')
          }
          style={styles.profileIcon}
        />
        {/* Right Icons (Notification and Drawer) */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}>
            <View style={{position: 'relative'}}>
              <Image
                source={require('../../assets/3.png')}
                style={styles.notifIcon}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <CustomDropdown />
        </View>
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
        </View>

        <View style={styles.infoContainer}>
          {/* Route Section - Always Displayed */}

          {/* Today's Date */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Today</Text>
            <Text style={styles.infoValue}>{getCurrentDate()}</Text>
          </View>

          {/* Time Left */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Route</Text>
            <Text style={styles.infoValue}>Dumaguete ➔</Text>
            <Text style={styles.infoValue}>Bacong</Text>
          </View>
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
    padding: 18,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    width: '100%',
    marginHorizontal: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  drawerIcon: {
    width: 20,
    height: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffff',
    marginTop: 20,
    textAlign: 'left',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tricycleContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  tricycleNumber: {
    fontSize: 60,
    marginLeft: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tricycleLabel: {
    fontSize: 16,
    marginLeft: 30,
    color: '#ffffff',
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
    color: '#ffffff',
  },
  infoValue: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reserveButton: {
    backgroundColor: '#62a287',
    padding: 10,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeUnit: {
    fontSize: 12,
    color: '#A8BAB7',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 8,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HeaderMain;
