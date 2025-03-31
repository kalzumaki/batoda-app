import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {post} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {
  RootStackParamList,
  UserQRCodeData,
} from '../../types/passenger-dashboard';
import BackButton from '../../components/BackButton';

// Define QR code data structures
interface DispatchQRCodeData {
  dispatch_id: number;
  wallet_id: number;
}

interface PayDispatcher {
  dispatch_id: number;
}

interface QRCodeEvent {
  data: string;
}

const ScanQRScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);

  // Handles QR Code scanning
  const handleQRCodeRead = async (event: QRCodeEvent) => {
    if (loading) return; // Prevent multiple scans while processing

    setLoading(true); // Show loading indicator
    console.log('QR Code Data:', event.data);

    try {
      const parsedData = JSON.parse(event.data);

      if (isDispatchQRCode(parsedData)) {
        await handleTransactionQRCode(parsedData);
      } else if (isDispatcherQRCode(parsedData)) {
        await handleDispatcherQRCode(parsedData);
      } else if (isUserQRCode(parsedData)) {
        handleUserQRCodeRead(parsedData);
      } else {
        throw new Error('Invalid QR Code format');
      }
    } catch (error) {
      console.error('QR Processing Error:', error);
      Alert.alert('Error', 'Invalid QR Code data. Please try again.');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };
  const isDispatcherQRCode = (data: any): data is PayDispatcher => {
    return data && typeof data.dispatch_id === 'number';
  };
  const handleDispatcherQRCode = async (data: PayDispatcher) => {
    try {
      const response = await post(API_ENDPOINTS.PAY_DISPATCHER, data, true);
      console.log('API Response:', response);

      if (response.status) {
        Alert.alert('Success', 'Dispatcher payment completed!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', response.message || 'Dispatcher payment failed');
      }
    } catch (error) {
      console.error('Dispatcher Transaction Error:', error);
      Alert.alert('Error', 'Transaction failed. Please try again.');
    }
  };
  // Type guards for QR code validation
  const isDispatchQRCode = (data: any): data is DispatchQRCodeData => {
    return (
      data &&
      typeof data.dispatch_id === 'number' &&
      typeof data.wallet_id === 'number'
    );
  };

  const isUserQRCode = (data: any): data is UserQRCodeData => {
    return data && typeof data.id === 'number' && typeof data.name === 'string';
  };

  // Handle transaction QR codes
  const handleTransactionQRCode = async (data: DispatchQRCodeData) => {
    try {
      const response = await post(API_ENDPOINTS.PAY_SEATS_QR, data, true);
      console.log('API Response:', response);

      if (response.status) {
        Alert.alert('Success', 'Transaction completed successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Transaction Error:', error);
      Alert.alert('Error', 'Transaction failed. Please try again.');
    }
  };

  // Handle user QR codes (redirect to UserDetailsScreen)
  const handleUserQRCodeRead = (data: UserQRCodeData) => {
    navigation.navigate('UserDetailsScreen', {user: data});
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <BackButton />

      {/* QR Code Scanner */}
      <QRCodeScanner
        onRead={handleQRCodeRead}
        flashMode={RNCamera.Constants.FlashMode.auto}
        reactivate={!loading} // Disable reactivation while loading
        reactivateTimeout={2000}
        showMarker={true}
        markerStyle={styles.marker}
        cameraStyle={styles.camera}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={styles.loadingText}>Processing QR Code...</Text>
        </View>
      )}

      <Text style={styles.description}>
        Align the QR code within the frame to scan.
      </Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  marker: {
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 10,
  },
  description: {
    position: 'absolute',
    bottom: 50,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
});

export default ScanQRScreen;
