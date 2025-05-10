import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {post} from '../utils/proxy';
import ButtonComponent from '../components/Button';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {RootStackParamList} from '../types/passenger-dashboard';
import LoginButtonComponent from '../components/LoginButton';
import {LoginPayload} from '../types/login';
import OptimisticFeedback from '../components/Loading';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Map user type IDs to user type names
const userTypeMap: { [key: number]: string } = {
  6: 'Driver',
  7: 'Dispatcher',
  8: 'Passenger',
};

const Login: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0); // Track login attempts
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false); // Disable button after 3 attempts
  const [retryTime, setRetryTime] = useState<number>(0); // Countdown time in seconds
  const navigation = useNavigation<NavigationProps>();

  // This useEffect will trigger when loginAttempts change
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // If login attempts exceed 3, disable button and start countdown
    if (loginAttempts >= 3) {
      setIsButtonDisabled(true);
      setRetryTime(60); // Set the initial retry time to 60 seconds

      // Start the countdown
      timer = setInterval(() => {
        setRetryTime(prevTime => {
          if (prevTime <= 1) {
            // Once countdown finishes, enable button and reset login attempts
            setIsButtonDisabled(false);
            setLoginAttempts(0);
            clearInterval(timer); // Clear the interval
            return 0;
          }
          return prevTime - 1; // Decrement the retry time
        });
      }, 1000);
    }

    // Cleanup the timer when the component unmounts or if loginAttempts reset
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [loginAttempts]); // This will run only when loginAttempts change

  const handleLogin = async () => {
    setIsLoggingIn(true);

    const payload: LoginPayload = {
      email_or_mobile: emailOrMobile,
      password: password,
    };

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

      // Proceed with login
      const data = await post(API_ENDPOINTS.LOGIN, payload);

      if (data?.status === false) {
        // If login failed
        const errorMessage = data?.message || 'Login Failed';
        const retryAfter = data?.retry_after;

        if (retryAfter && retryAfter > 0) {
          setRetryTime(retryAfter); // Set retry time for UI update
          setLoginAttempts(3); // Disable the button after 3 failed attempts
        }

        Toast.show({
          type: 'error',
          text1: errorMessage,
          text2: retryAfter
            ? `Please try again in ${retryAfter.toFixed(0)} seconds.`
            : '',
        });
        return;
      }

      // Successful login flow
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
          case 6:
            navigation.replace('DriverDashboard');
            break;
          case 7:
            navigation.replace('DispatcherDashboard');
            break;
          case 8:
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
          text2: errorMessage,
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
        disabled={isButtonDisabled} // Disable button after 3 attempts
      />
      <ButtonComponent
        title="Register"
        onPress={() => navigation.navigate('Register')}
        color="#40916C"
      />
      {isLoggingIn && <OptimisticFeedback action="login" />}

      {/* Show retry time countdown */}
      {isButtonDisabled && retryTime > 0 && (
        <Text style={styles.retryText}>
          Please wait {retryTime} seconds before trying again.
        </Text>
      )}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  retryText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 10,
  },
});

export default Login;
