import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import {post} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import SuccessAlertModal from '../components/SuccessAlertModal';
import ErrorAlertModal from '../components/ErrorAlertModal';

type RouteParams = {
  email: string;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChangePassEmailVer'
>;

const ChangePassEmailVer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const {email} = route.params as RouteParams;
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState<string>('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [title, setTitle] = useState<string>('');
  const handleProceed = async () => {
    setLoading(true);
    try {
      const response = await post(API_ENDPOINTS.SEND_OTP_PASSWORD_RESET, {
        email,
      });

      if (response.status) {
        setShowResponseMessage(`A 6-digit OTP has been sent to ${email}`);
        setTitle('OTP sent successfully.');
        setIsSuccessModalVisible(true);
        console.log('Navigating to ChangePassword with email:', email);
      } else {
        setShowResponseMessage(response.message);
        setTitle('Error');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      setShowResponseMessage('Failed to send OTP. Please try again.');
      setTitle('Error');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.emailText}>{email}</Text>
      <Text style={styles.description}>
        This email will receive an OTP for Password Reset
      </Text>

      <Text style={styles.guidanceText}>
        Press "Proceed" to receive a 6-digit OTP on your email for verification.
      </Text>

      <TouchableOpacity
        style={[styles.proceedButton, loading && {backgroundColor: '#ccc'}]}
        onPress={handleProceed}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.proceedText}>Proceed</Text>
        )}
      </TouchableOpacity>
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title={title}
        message={showResponseMessage}
        onDismiss={() => {
          setIsSuccessModalVisible(false);
          navigation.navigate('ChangePassword', {email});
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

export default ChangePassEmailVer;
