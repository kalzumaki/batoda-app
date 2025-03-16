import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import {post} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import Icon from 'react-native-vector-icons/Ionicons';

const ChangePasswordScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {email} = route.params as {email: string};

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(prev => !prev);

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      console.log('Password mismatch:', password, confirmPassword); // Log for password mismatch
      return;
    }

    console.log('Preparing to change password...');
    console.log('Payload:', {
      email,
      otp,
      password,
      password_confirmation: confirmPassword,
    });

    setLoading(true);
    try {
      // Prepare the payload as per the required format
      const payload = {
        email,
        otp,
        password, // new password
        password_confirmation: confirmPassword, // password confirmation
      };

      // Send the request with the prepared payload
      console.log('Sending request to change password...');
      const response = await post(
        API_ENDPOINTS.VERIFY_OTP_CHANGE_PASSWORD,
        payload,
      );

      console.log('Response received:', response); // Log the response

      if (response.status) {
        Alert.alert('Success', 'Password changed successfully!');
        console.log('Password changed successfully!');
        navigation.navigate('Settings');
      } else {
        // Check if the error is specific to changing the password twice in one day
        if (
          response.error === 'You can only update your password once per day.'
        ) {
          Alert.alert('Error', response.error);
          console.log(
            'Error: User attempted to change password twice in one day.',
          );
        } else {
          Alert.alert(
            'Error',
            response.message || 'Failed to change password.',
          );
          console.log(
            'Error response:',
            response.message || 'Failed to change password',
          );
        }
      }
    } catch (error: any) {
      // Check if the error is a network error or a 400 error
      if (error.response) {
        // Server-side error response
        const apiError = error.response.data || error.response;
        console.log('API Error:', apiError);
        if (apiError && apiError.error) {
          Alert.alert('Error', apiError.error);
          console.log('Backend Error:', apiError.error);
        } else {
          Alert.alert('Error', 'Failed to change password. Please try again.');
          console.log('Error response:', apiError);
        }
      } else {
        // Network or other errors
        Alert.alert('Error', 'Failed to change password. Please try again.');
        console.error('Network error or unexpected error:', error);
      }
    } finally {
      setLoading(false);
      console.log('Password change process finished.');
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled || resendLoading) return;

    setResendDisabled(true);
    setCountdown(120); // Reset countdown
    setResendLoading(true);

    try {
      const response = await post(API_ENDPOINTS.SEND_OTP_PASSWORD_RESET, {
        email,
      });

      if (response.status) {
        Alert.alert('Success', 'OTP resent successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);

      // Countdown logic
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer);
            setResendDisabled(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Change Password</Text>

      <Text style={styles.label}>OTP</Text>
      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Text style={styles.note}>
        NOTE: You can change your password only once per day.
      </Text>
      <TouchableOpacity
        style={[styles.button, loading && {backgroundColor: '#ccc'}]}
        onPress={handleChangePassword}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={resendDisabled || resendLoading}
          style={[
            styles.resendButton,
            (resendDisabled || resendLoading) && {backgroundColor: '#ccc'},
          ]}>
          {resendLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resendText}>
              {resendDisabled
                ? `Resend OTP (${formatCountdown(countdown)})`
                : 'Resend OTP'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#469c8f',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#469c8f',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: 'red',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#469c8f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    backgroundColor: '#469c8f',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButton: {
    backgroundColor: '#469c8f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resendText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
