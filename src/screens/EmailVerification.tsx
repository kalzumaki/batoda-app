import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/passenger-dashboard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {fetchToken, post, postWithHeaders, put} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton';

type EmailVerificationRouteProp = RouteProp<
  RootStackParamList,
  'EmailVerification'
>;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;

const EmailVerification: React.FC = () => {
  const route = useRoute<EmailVerificationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {email} = route.params;
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      // 1. Update user email
      console.log('Updating email...');
      await put(API_ENDPOINTS.UPDATE_USER_DETAILS, {email}, true);
      console.log('Email updated successfully.');

      // 2. Send OTP verification code
      console.log('Sending verification code...');
      await postWithHeaders(API_ENDPOINTS.SENDING_EMAIL_VERIFICATION, {}, true);
      console.log('Verification code sent.');

      // 3. Navigate to OTP Verification screen
      navigation.navigate('OTPVerification', {email});
    } catch (error) {
      console.error('Error updating email or sending OTP:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <BackButton />
    <Text style={styles.title}>Email Verification</Text>
    <Text style={styles.emailText}>{email}</Text>
    <Text style={styles.description}>Are you sure this is your email?</Text>

    <Text style={styles.guidanceText}>
      Press "Proceed" to receive a 6-digit OTP on your email for verification.
    </Text>

    <TouchableOpacity
      style={[styles.proceedButton, loading && { backgroundColor: '#ccc' }]}
      onPress={handleProceed}
      disabled={loading}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.proceedText}>Proceed</Text>
      )}
    </TouchableOpacity>
  </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#469c8f',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#469c8f',
    textAlign: 'center',
    marginBottom: 30,
  },
  proceedButton: {
    backgroundColor: '#469c8f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  proceedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidanceText: {
    fontSize: 14,
    color: '#469c8f',
    textAlign: 'center',
    marginBottom: 20,
  },

});

export default EmailVerification;
