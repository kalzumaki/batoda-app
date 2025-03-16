import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/passenger-dashboard';
import BackButton from '../components/BackButton';
import { post } from '../utils/proxy';
import { API_ENDPOINTS } from '../api/api-endpoints';

type RouteParams = {
  email: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChangePassEmailVer'>;

const ChangePassEmailVer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { email } = route.params as RouteParams;
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    try {
      const response = await post(API_ENDPOINTS.SEND_OTP_PASSWORD_RESET, { email });

      if (response.status) {
        Alert.alert('OTP Sent', `A 6-digit OTP has been sent to ${email}`);
        console.log('Navigating to ChangePassword with email:', email);
        navigation.navigate('ChangePassword', { email });
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
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
        style={[styles.proceedButton, loading && { backgroundColor: '#ccc' }]}
        onPress={handleProceed}
        disabled={loading}
      >
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

export default ChangePassEmailVer;
