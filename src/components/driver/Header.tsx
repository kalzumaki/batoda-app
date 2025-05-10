import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {get} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePictureListener from '../../pusher/ProfilePictureUploaded';
import CustomDropdown from '../MenuDropdown';
import {
  RefreshTriggerProp,
  RootStackParamList,
} from '../../types/passenger-dashboard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {User} from '../../types/user';
import ShowDispatches from './ShowDispatches';
import {API_URL, STORAGE_API_URL} from '@env';
import useSocketListener from '../../hooks/useSocketListener';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Header: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [driverData, setDriverData] = useState<User | null>(null);
  const navigation = useNavigation<NavigationProps>();
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const checkUser = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('User Token from headercomponent: ', token);

        try {
          const response = await get(API_ENDPOINTS.USERS_TOKEN);
          const data = response.data;
          setAuthenticatedUser(data);
          console.log('data found in header component: ', data);

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
    const fetchDriverData = async () => {
      try {
        const response = await get(API_ENDPOINTS.APPROVED_DISPATCH);
        const data = response.data;
        setDriverData(data);
        console.log('Driver data Approved Dispatch:', data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      }
    };
    checkUser();
    fetchDriverData();
  }, [refreshTrigger]);
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

  return (
    <View style={styles.container}>
      {/* Profile Picture Listener */}

      {/* {profileImage && (
        <Image
            source={{ uri: profileImage }}
            style={styles.profileIcon}
        />
    )} */}
      {/* {authenticatedUser && authenticatedUser.id && (
        <ProfilePictureListener userId={authenticatedUser.id} />
      )} */}

      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Profile Image */}
        <Image
          source={
            profileImage && profileImage.startsWith('http')
              ? {uri: profileImage}
              : require('../../assets/25.png')
          }
          style={styles.profileIcon}
        />

        {/* Right Icons (Notification and Dropdown) */}
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
      <ShowDispatches refreshTrigger={refreshTrigger} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#2d665f',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 2,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
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

export default Header;
