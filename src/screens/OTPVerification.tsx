import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/passenger-dashboard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {postWithHeaders, post} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import ErrorAlertModal from '../components/ErrorAlertModal';
import SuccessAlertModal from '../components/SuccessAlertModal';

type OTPVerificationRouteProp = RouteProp<
  RootStackParamList,
  'OTPVerification'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const OTPVerification: React.FC = () => {
  const route = useRoute<OTPVerificationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {email} = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isSuccessModalNavigation, setIsSuccessModalNavigation] =
    useState(false);
  const [title, setTitle] = useState<string>('');
  const handleChange = (text: string, index: number) => {
    if (/^[0-9]$/.test(text) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setShowResponseMessage('Please enter a 6-digit OTP. OTP');
      setTitle('Invalid OTP');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await post(
        API_ENDPOINTS.VERIFY_EMAIL_OTP,
        {otp: fullOtp}, // Send OTP as a string if the backend expects that
        true,
      );

      if (response.status) {
        setShowResponseMessage('Email verified successfully!');
        setTitle('Success');
        setIsSuccessModalNavigation(true);

      } else {
        setShowResponseMessage(response.message || 'Invalid OTP.');
        setTitle('Error Verifying OTP');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setShowResponseMessage(error.response.data.message);
        setTitle('Error Verifying OTP');
        setShowErrorModal(true);
      } else {

        setShowResponseMessage('Something went wrong. Please try again.');
        setTitle('Error');
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setResendDisabled(true);
    setCountdown(120); // Reset countdown
    setLoading(true);

    try {
      const response = await postWithHeaders(
        API_ENDPOINTS.SENDING_EMAIL_VERIFICATION,
        {email},
        true,
      );

      if (response.status) {
        setShowResponseMessage(`A 6-digit OTP has been sent to ${email}`);
        setTitle('OTP Resent');
        setIsSuccessModalVisible(true);
      } else {
        setShowResponseMessage(response.message || 'Failed to resend OTP.');
        setTitle('Error Resending OTP');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);

      setShowResponseMessage('Something went wrong. Please try again.');
      setTitle('Error');
      setShowErrorModal(true);
    } finally {
      setLoading(false);

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.emailText}>{email}</Text>
      <Text style={styles.description}>
        Enter the 6-digit OTP sent to your email.
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, loading && {backgroundColor: '#ccc'}]}
        onPress={handleVerifyOtp}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.verifyText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleResendOtp}
        disabled={resendDisabled || loading}>
        <Text
          style={[
            styles.resendText,
            (resendDisabled || loading) && {color: 'gray'},
          ]}>
          {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
          setIsSuccessModalVisible(false);

        }}
      />
      <SuccessAlertModal
        visible={isSuccessModalNavigation}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
            setIsSuccessModalNavigation(false);
            navigation.navigate('Settings');
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
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderColor: '#469c8f',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    marginHorizontal: 5,
    backgroundColor: 'white',
    color: 'black',
  },
  verifyButton: {
    backgroundColor: '#469c8f',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  verifyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#469c8f',
    marginTop: 15,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default OTPVerification;
