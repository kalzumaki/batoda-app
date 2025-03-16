import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import {get} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

type UserProfile = {
  fname: string;
  lname: string;
  gender: string;
  age: string;
  birthday: string;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await get(API_ENDPOINTS.DISPLAY_USER_DETAILS);
      if (response.status) {
        setProfileData(response.user);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const handleEdit = (field: string, value: string) => {
    navigation.navigate('EditProfile', {field, value});
  };

  const renderEditableField = (
    label: string,
    value: string,
    field: string,
    editable: boolean = true,
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.value}>{value}</Text>
        {editable && (
          <TouchableOpacity onPress={() => handleEdit(field, value)}>
            <Icon name="pencil-outline" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#469c8f" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../assets/24.png')}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.profileName}>
          {profileData.fname} {profileData.lname}
        </Text>
      </View>

      {renderEditableField('First Name', profileData.fname, 'fname')}
      {renderEditableField('Last Name', profileData.lname, 'lname')}
      {renderEditableField(
        'Gender',
        profileData.gender.charAt(0).toUpperCase() +
          profileData.gender.slice(1),
        'gender',
      )}
      {renderEditableField('Age', String(profileData.age), 'age', false)}
      {renderEditableField('Birthdate', profileData.birthday, 'birthday')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  editProfileText: {
    fontSize: 20,
    marginLeft: 10,
    color: 'black',
  },
  spacer: {
    height: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#469c8f',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#469c8f',
    paddingVertical: 8,
  },
  value: {
    fontSize: 16,
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default ProfileScreen;
