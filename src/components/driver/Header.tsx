import React, {useState, useEffect} from 'react';
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
import { API_URL, STORAGE_API_URL } from '@env';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Header: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [driverData, setDriverData] = useState<User | null>(null);
  const navigation = useNavigation<NavigationProps>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
          <TouchableOpacity>
            <Image
              source={require('../../assets/3.png')}
              style={styles.notifIcon}
            />
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
});

export default Header;
