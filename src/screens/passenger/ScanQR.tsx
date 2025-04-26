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
import {post} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {
  RootStackParamList,
  UserQRCodeData,
} from '../../types/passenger-dashboard';
import BackButton from '../../components/BackButton';
import ErrorAlertModal from '../../components/ErrorAlertModal';
import SuccessAlertModal from '../../components/SuccessAlertModal';

// Define QR code data structures
interface DispatchQRCodeData {
  dispatch_id: number;
  wallet_id: number;
  dispatch_reservation_id: number;
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState('');
  const handleQRCodeRead = async (event: QRCodeEvent) => {
    if (loading) return;

    setLoading(true);
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
        // throw new Error('Invalid QR Code format');
        setShowResponseMessage('Invalid QR Code format');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('QR Processing Error:', error);
      setShowResponseMessage('Invalid QR Code data. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
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
        setShowResponseMessage(response.message);
        setShowSuccessModal(true);
      } else {
        setShowResponseMessage(response.message || 'Dispatcher payment failed');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Dispatcher Transaction Error:', error);
      setShowResponseMessage('Transaction failed. Please try again.');
      setShowErrorModal(true);
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
        setShowResponseMessage(response.message);
        setShowSuccessModal(true);
      } else {
        setShowResponseMessage(response.message || 'Transaction failed');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Transaction Error:', error);

      setShowResponseMessage('Transaction failed. Please try again.');
      setShowErrorModal(true);
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
        reactivate={!loading}
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
      <SuccessAlertModal
        visible={showSuccessModal}
        title="Success"
        message={showResponseMessage}
        onDismiss={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />

      <ErrorAlertModal
        visible={showErrorModal}
        title="Transaction Error"
        message={showResponseMessage || 'Something went wrong'}
        onDismiss={() => setShowErrorModal(false)}
      />
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
