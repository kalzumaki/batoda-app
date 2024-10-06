// src/screens/Login.tsx

import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LoginPayload} from '../types/login';
import {useNavigation} from '@react-navigation/native';
import {post} from '../utils/proxy';
import ButtonComponent from '../components/Button';
import InputComponent from '../components/Input';
import PasswordInput from '../components/PasswordInput'; // Import PasswordInput
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getErrorMessage } from '../utils/errorHandler';
import axios from 'axios';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProps>();
  const handleLogin = async () => {
    const payload: LoginPayload = {
      email_or_mobile: emailOrMobile,
      password: password,
    };
  
    console.log('Logging in with payload:', payload);
  
    try {
      const data = await post('/login', payload); // Sending login request
      console.log('Login response:', data);
  
      const token = data.access_token;
      if (token) {
        await AsyncStorage.setItem('userToken', token);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });
      } else {
        throw new Error('Token not found in response.');
      }
    } catch (error: any) {
      console.log('API request error:', error); // Log the error for debugging
  
      // Manual error handling: Check for message in error object and status code
      const errorMessage = error?.message || 'An unexpected error occurred.';
      
      if (errorMessage.includes('401')) {
        // Handle unauthorized error manually
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid email, mobile number, or password.',
        });
      } else if (errorMessage.includes('403')) {
        // Handle forbidden error for unapproved account
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Your account is not approved. Please contact the administrator.',
        });
      } else {
        // Handle any other generic errors
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: errorMessage,
        });
      }
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
      <ButtonComponent title="Login" onPress={handleLogin} color="#2D6A4F" />
      <ButtonComponent
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
        color="#40916C"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#95D5B2', // Light green background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#081C15', // Dark green text color
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default Login;
