import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
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
  email: string;
  phoneNumber: string;
  password: string;
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const data = await get(API_ENDPOINTS.DISPLAY_USER_DETAILS);
      console.log('Settings Data Found: ', data);

      if (data && data.status) {
        setProfileData({
          email: data.user.email,
          phoneNumber: data.user.mobile_number,
          password: '****************',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  const handleEdit = (field: string, value: string) => {
    if (field === 'password') {
      if (profileData?.email) {
        navigation.navigate('ChangePassEmailVer', {email: profileData.email});
      } else {
        Alert.alert('Error', 'Email is missing.');
      }
    } else {
      navigation.navigate('EditProfile', {field, value});
    }
  };

  const renderEditableField = (label: string, value: string, field: string) => (
    <View style={styles.fieldContainer} key={field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} value={value} editable={false} />
        <TouchableOpacity onPress={() => handleEdit(field, value)}>
          <Icon name="pencil-outline" size={20} color="gray" />
        </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Account Details</Text>

      {profileData && (
        <>
          {renderEditableField('Email', profileData.email, 'email')}
          {renderEditableField(
            'Phone Number',
            profileData.phoneNumber,
            'mobile_number',
          )}
          {renderEditableField('Password', profileData.password, 'password')}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    color: 'black',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#469c8f',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
});

export default SettingsScreen;
