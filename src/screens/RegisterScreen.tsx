import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import LoginButtonComponent from '../components/LoginButton';
import ButtonComponent from '../components/Button';
import {post} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OptimisticFeedback from '../components/Loading';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownComponent from '../components/Dropdown';
import DatePickerComponent from '../components/DatePicker';

// Define the navigation types
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Type for navigation props
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Register: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    password_confirmation: '',
    mobile_number: '',
    address: '',
    birthday: '',
    gender: 'male',
    user_type_id: 8,
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (key: string, value: string | number) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const validateEmail = (email: string) => {
    return /^(.*@gmail\.com|.*@yahoo\.com)$/.test(email);
  };

  const validateMobileNumber = (number: string) => {
    return /^\d{11}$/.test(number);
  };

  const handleRegister = async () => {
    if (formData.password !== formData.password_confirmation) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match. Please try again.',
      });
      return;
    }

    console.log('Form Data being sent:', JSON.stringify(formData, null, 2));

    setIsRegistering(true);
    try {
      const data = await post(API_ENDPOINTS.REGISTER, formData);
      console.log('New User Registered:', data);

      Toast.show({
        type: 'success',
        text1: 'Check Email for Verification!',
        text2: 'Registration Successful',
      });

      // Redirect to login or another screen
      navigation.navigate('Login');
    } catch (error: any) {
      console.log(
        'API request error:',
        error?.response?.data || error?.message,
      );

      const errorMessage = error?.response?.data?.message || error?.message;

      if (errorMessage.includes('email has already been taken')) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Email is already in use. Try another one.',
        });
      } else if (errorMessage.includes('422')) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Please fill in all required fields correctly.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: errorMessage,
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* <Text style={styles.title}>SIGN UP</Text> */}

        <InputComponent
          placeholder="First Name"
          value={formData.fname}
          onChangeText={text => handleChange('fname', text)}
        />
        <InputComponent
          placeholder="Last Name"
          value={formData.lname}
          onChangeText={text => handleChange('lname', text)}
        />
        <InputComponent
          placeholder="Email"
          value={formData.email}
          onChangeText={text => handleChange('email', text)}
        />
        <InputComponent
          placeholder="Mobile Number"
          value={formData.mobile_number}
          keyboardType="numeric"
          maxLength={11}
          onChangeText={text => {
            const numericText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            handleChange('mobile_number', numericText);
          }}
        />

        <InputComponent
          placeholder="Address"
          value={formData.address}
          onChangeText={text => handleChange('address', text)}
        />
        {/* DATE PICKER */}
        <DatePickerComponent
          value={formData.birthday}
          onChange={date => handleChange('birthday', date)}
        />

        {showDatePicker && (
          <DateTimePicker
            value={formData.birthday ? new Date(formData.birthday) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate)
                handleChange(
                  'birthday',
                  selectedDate.toISOString().split('T')[0],
                );
            }}
          />
        )}

        <DropdownComponent
          label="Gender"
          selectedValue={formData.gender ?? 'male'}
          onValueChange={value => handleChange('gender', value)}
          options={[
            {label: 'Male', value: 'male'},
            {label: 'Female', value: 'female'},
          ]}
        />

        <DropdownComponent
          label="User Type"
          selectedValue={formData.user_type_id ?? 8} // Default to 8 only in the dropdown
          onValueChange={value => handleChange('user_type_id', value)}
          options={[
            {label: 'Passenger', value: 8},
            {label: 'Driver', value: 6},
            {label: 'Dispatcher', value: 7},
          ]}
        />

        <PasswordInput
          placeholder="Password"
          value={formData.password}
          onChangeText={text => handleChange('password', text)}
        />
        <PasswordInput
          placeholder="Confirm Password"
          value={formData.password_confirmation}
          onChangeText={text => handleChange('password_confirmation', text)}
        />

        <LoginButtonComponent
          title="Register"
          onPress={handleRegister}
          color="#2D6A4F"
          loading={isRegistering}
        />
        <ButtonComponent
          title="Go to Login"
          onPress={() => navigation.navigate('Login')}
          color="#40916C"
        />

        {isRegistering && <OptimisticFeedback action="register" />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95D5B2',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#081C15',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default Register;
