import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import SuccessAlertModal from '../components/SuccessAlertModal';
import ErrorAlertModal from '../components/ErrorAlertModal';

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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');
  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(prev => !prev);

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {

      setShowResponseMessage('Passwords do not match.');
      setTitle('Password Mismatch');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      };

      const response = await post(
        API_ENDPOINTS.VERIFY_OTP_CHANGE_PASSWORD,
        payload,
      );

      if (response.status) {
        setShowResponseMessage('Password changed successfully!');
        setTitle('Success');
        setIsSuccessModalVisible(true);
        navigation.navigate('Settings');
      } else {
        setShowResponseMessage(response.error || 'Failed to change password. Or you have already changed your password today.');
        setTitle('Error Changing Password');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setShowResponseMessage(
          error.response.data.error || 'Failed to change password.',
        );
        setTitle('Error');
        setShowErrorModal(true);
      } else {
        setTitle('Error Changing Password');
        setShowResponseMessage(
          error?.response?.data?.message ||
            'An error occurred while changing password',
        );
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
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
        setShowResponseMessage(`A 6-digit OTP has been resent to ${email}`);
        setTitle('OTP Resent Successfully');
        setIsSuccessModalVisible(true);
      } else {
        setShowResponseMessage(response.message || 'Failed to resend OTP.');
        setTitle('Error Resending OTP');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setShowResponseMessage(
        'An error occurred while resending OTP. Please try again.',
      );
      setTitle('Error Resending OTP');
      setShowErrorModal(true);
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <View style={{marginRight: 8}}>
            <Icon
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#469c8f"
            />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
          <View style={{marginRight: 8}}>
            <Icon
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#469c8f"
            />
          </View>
        </TouchableOpacity>
      </View>

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
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
          setIsSuccessModalVisible(false);
        //   navigation.goBack();
        }}
      />

      <ErrorAlertModal
        visible={showErrorModal}
        title={title}
        message={showResponseMessage}
        onDismiss={() => setShowErrorModal(false)}
      />
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#469c8f',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: 'black',
  },
  icon: {
    padding: 10,
    marginRight: 5,
  },
});

export default ChangePasswordScreen;
