import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/passenger-dashboard';
import Icon from 'react-native-vector-icons/Ionicons';
import {put} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import GenderPicker from '../components/GenderPicker';
import DatePickerComponent from '../components/DatePicker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import SuccessAlertModal from '../components/SuccessAlertModal';
import ErrorAlertModal from '../components/ErrorAlertModal';

// Types
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditProfile'
>;
type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditProfileRouteProp>();
  const {field, value} = route.params;

  const [editedValue, setEditedValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    if (field === 'gender' || field === 'birthday') {
      setEditedValue(value);
    }
  }, [field, value]);

  const handleCancel = () => navigation.goBack();

  const handleSubmit = async () => {
    if (editedValue === value) {
      setShowResponseMessage(
        `No changes were made to your ${fieldLabels[field] || field}.`,
      );
      setTitle('No Changes');
      setShowErrorModal(true);
      return;
    }

    if (field === 'mobile_number' && !/^09\d{9}$/.test(editedValue)) {
      setShowResponseMessage(
        'Please enter a valid 11-digit phone number starting with 09.',
      );
      setTitle('Invalid Phone Number');
      setShowErrorModal(true);
      return;
    }

    if (
      field === 'email' &&
      !/^[\w.-]+@(gmail\.com|yahoo\.com|[\w.-]+\.(com|net|org|gov|edu|ph|io|co))$/.test(
        editedValue,
      )
    ) {
      setShowResponseMessage(
        'Please enter a valid email address (e.g., @yahoo or @gmail).',
      );
      setTitle('Invalid Email');
      setShowErrorModal(true);
      return;
    }

    if (field === 'email') {
      navigation.navigate('EmailVerification', {email: editedValue});
      return;
    }

    setLoading(true);
    try {
      const updatedData = {[field]: String(editedValue)};
      console.log('Updating with:', updatedData);

      const response = await put(
        API_ENDPOINTS.UPDATE_USER_DETAILS,
        updatedData,
        true,
      );

      if (response.status) {
        setShowResponseMessage(
          `${fieldLabels[field] || field} updated to: ${editedValue}`,
        );
        setTitle('Profile Updated');
        setIsSuccessModalVisible(true);
      } else if (response.message) {
        setShowResponseMessage(response.message);
        setTitle('Update Failed');
        setShowErrorModal(true);
      } else {
        setShowResponseMessage(response.message);
        setTitle('Update Error');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'An error occurred while updating profile',
      );
      setShowResponseMessage(
        error?.response?.data?.message ||
          'An error occurred while updating profile',
      );
      setTitle('Error');
      setShowErrorModal(true);
    } finally {
      setLoading(false);

    }
  };

  const fieldLabels: {[key: string]: string} = {
    fname: 'First Name',
    lname: 'Last Name',
    gender: 'Gender',
    age: 'Age',
    birthday: 'Birthdate',
    mobile_number: 'Phone Number',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} disabled={loading}>
          <Icon name="close" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {fieldLabels[field] ||
            field
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/\b\w/g, c => c.toUpperCase())}
        </Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#469c8f" />
          ) : (
            <Icon name="checkmark" size={28} color="#469c8f" />
          )}
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {fieldLabels[field] ||
            field
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/\b\w/g, c => c.toUpperCase())}
        </Text>
        {field === 'gender' ? (
          <GenderPicker
            selectedGender={editedValue}
            onSelectGender={setEditedValue}
          />
        ) : field === 'birthday' ? (
          <DatePickerComponent value={editedValue} onChange={setEditedValue} />
        ) : (
          <TextInput
            style={styles.input}
            value={editedValue}
            onChangeText={setEditedValue}
            keyboardType={field === 'mobile_number' ? 'phone-pad' : 'default'}
            maxLength={field === 'mobile_number' ? 11 : undefined}
          />
        )}
        <Text style={styles.description}>
          Use the name people recognize you by, whether it's your full name or
          your business name, to help others find your account.
        </Text>
        <SuccessAlertModal
          visible={isSuccessModalVisible}
          title={title}
          message={showResponseMessage}
          onDismiss={() => {
            setIsSuccessModalVisible(false);
            navigation.goBack();
          }}
        />

        <ErrorAlertModal
          visible={showErrorModal}
          title={title}
          message={showResponseMessage}
          onDismiss={() => setShowErrorModal(false)}
        />
      </View>
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
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    color: 'black',
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#469c8f',
  },
  input: {
    fontSize: 16,
    color: 'black',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    fontSize: 12,
    color: '#469c8f',
  },
});

export default EditProfileScreen;
