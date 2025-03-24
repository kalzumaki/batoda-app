import React, {useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {LoginPayload} from '../types/login';
import {useNavigation} from '@react-navigation/native';
import {post} from '../utils/proxy';
import ButtonComponent from '../components/Button';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userTypeMap} from '../types/userType';
import OptimisticFeedback from '../components/Loading';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {RootStackParamList} from '../types/login';
import LoginButtonComponent from '../components/LoginButton';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Login: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProps>();

  const handleLogin = async () => {
    setIsLoggingIn(true);

    const payload: LoginPayload = {
      email_or_mobile: emailOrMobile,
      password: password,
    };

    console.log('Checking user approval status:', payload.email_or_mobile);

    try {
      // First, check if the user exists and is approved
      const userStatus = await post(API_ENDPOINTS.CHECK_USER_STATUS, {
        email_or_mobile: emailOrMobile,
      });

      if (userStatus?.is_approved === 0) {
        Toast.show({
          type: 'error',
          text1: 'Account Pending Approval',
          text2: 'Your account has not been approved by the president yet.',
        });
        return;
      }

      console.log('Logging in with payload:', payload);

      // Proceed with login
      const data = await post(API_ENDPOINTS.LOGIN, payload);
      console.log('Login response:', data);

      const token = data.access_token;
      const userType = data.user.user_type_id;
      await AsyncStorage.setItem('userId', data.user.id.toString());
      await AsyncStorage.setItem('userType', userType.toString());
      if (token) {
        await AsyncStorage.setItem('userToken', token);

        const userTypeName = userTypeMap[userType] || 'User';

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome ${
            userTypeName.charAt(0).toUpperCase() + userTypeName.slice(1)
          }!`,
        });

        switch (userType) {
          case 6: // Driver
            navigation.replace('DriverDashboard');
            break;
          case 7: // Dispatcher
            navigation.replace('DispatcherDashboard');
            break;
          case 8: // Passenger
            navigation.replace('PassengerDashboard');
            break;
          default:
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Invalid user type.',
            });
        }
      } else {
        throw new Error('Token not found in response.');
      }
    } catch (error: any) {
      console.log('API request error:', error);
      const errorMessage =
        error?.response?.data?.message || 'An unexpected error occurred.';

      if (error?.response?.status === 403) {
        if (errorMessage.toLowerCase().includes('not approved')) {
          Toast.show({
            type: 'error',
            text1: 'Account Not Approved',
            text2: 'Your account has not been approved by the president yet.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Email Not Verified',
            text2: 'Please verify your email before logging in.',
          });
        }
      } else if (error?.response?.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid email, mobile number, or password.',
        });
      } else if (error?.response?.status === 422) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Input Fields are required.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
      {/* <Text style={styles.title}>BATODA</Text> */}

      <InputComponent
        placeholder="Email or Mobile"
        value={emailOrMobile}
        onChangeText={setEmailOrMobile}
      />
      <PasswordInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <LoginButtonComponent
        title="Login"
        onPress={handleLogin}
        color="#2D6A4F"
        loading={isLoggingIn}
      />
      <ButtonComponent
        title="Register"
        onPress={() => navigation.navigate('Register')}
        color="#40916C"
      />
      {isLoggingIn && <OptimisticFeedback action="login" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#95D5B2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#081C15',
    marginBottom: 24,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});

export default Login;
