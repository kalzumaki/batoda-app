import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import {get, post, postFormData} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import ProfilePictureListener from '../pusher/ProfilePictureUploaded';
import {API_URL, STORAGE_API_URL} from '@env';
import SuccessAlertModal from '../components/SuccessAlertModal';
import ErrorAlertModal from '../components/ErrorAlertModal';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

type UserProfile = {
  id: string;
  fname: string;
  lname: string;
  gender: string;
  age: string;
  birthday: string;
  profile?: string;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await get(API_ENDPOINTS.DISPLAY_USER_DETAILS);
      if (response.status) {
        setProfileData(response.user);
        if (response.user.profile) {
          const fullImageUrl = `${STORAGE_API_URL}/storage/${response.user.profile}`;
          setProfileImage(fullImageUrl);
        } else {
          const fullName = `${response.user.fname} ${response.user.lname}`;
          const encodedName = encodeURIComponent(fullName);
          const imageUrl = `https://avatar.iran.liara.run/username?username=${encodedName}`;
          setProfileImage(imageUrl);
        }
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    const pickerResult = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 1,
    });

    if (pickerResult.didCancel) {
      return;
    }

    if (pickerResult.errorCode) {
      setShowResponseMessage(
        pickerResult.errorMessage || 'Failed to pick image.',
      );
      setTitle('Image Picker Error');
      setShowErrorModal(true);
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      const formData = new FormData();
      formData.append('profile', {
        uri,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      try {
        const response = await postFormData(
          API_ENDPOINTS.UPDATE_USER_PROFILE_PIC,
          formData,
          true,
        );
        console.log('Upload Success:', response);

        if (response.status) {
          setShowResponseMessage(response.message);
          setTitle('Profile Picture Updated');
          setIsSuccessModalVisible(true);
          fetchProfile();
        } else {
            setShowResponseMessage(
                response.message || 'Failed to upload profile picture.',
            );
            setTitle('Upload Error');
            setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setShowResponseMessage(
            'An error occurred while uploading the profile picture.',
        );
        setTitle('Upload Error');
        setShowErrorModal(true);
      }
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
        <TouchableOpacity
          onPress={handleImageUpload}
          style={styles.profileImageContainer}>
          <Image source={{uri: profileImage}} style={styles.profileImage} />
          <Icon name="pencil" size={24} color="white" style={styles.editIcon} />
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {profileData.fname} {profileData.lname}
        </Text>
        <SuccessAlertModal
          visible={isSuccessModalVisible}
          title={title}
          message={showResponseMessage}
          onDismiss={() => setIsSuccessModalVisible(false)}
        />

        <ErrorAlertModal
          visible={showErrorModal}
          title={title}
          message={showResponseMessage}
          onDismiss={() => setShowErrorModal(false)}
        />
      </View>

      <ProfilePictureListener userId={profileData.id} />

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
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    borderRadius: 12,
    padding: 4,
  },
});

export default ProfileScreen;
