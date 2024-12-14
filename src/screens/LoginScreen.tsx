import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
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

    console.log('Logging in with payload:', payload);

    try {
      const data = await post(API_ENDPOINTS.LOGIN, payload);
      console.log('Login response:', data);

      const token = data.access_token;
      const userType = data.user.user_type_id;

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
      const errorMessage = error?.message || 'An unexpected error occurred.';

      if (errorMessage.includes('401')) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid email, mobile number, or password.',
        });
      } else if (errorMessage.includes('422')) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Input Fields are required to Fill up.',
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
      <Text style={styles.title}>Login</Text>
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
});

export default Login;
