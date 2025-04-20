import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {User} from '../../types/user';
import {STORAGE_API_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {DispatchResponse, Dispatch} from '../../types/approved-dispatch';
import CustomDropdown from '../MenuDropdown';

const Header: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);



  useEffect(() => {
    const checkUser = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('User Token from dispatcher header component: ', token);

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
    checkUser();
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
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#2d665f',
    alignSelf: 'stretch',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
