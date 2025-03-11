import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { post } from '../../utils/proxy';
import { API_ENDPOINTS } from '../../api/api-endpoints';

// Define types
interface QRCodeData {
  dispatch_id: number;
  wallet_id: number;
}

interface QRCodeEvent {
  data: string;
}

const ScanQRScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleQRCodeRead = async (event: QRCodeEvent) => {
    console.log('QR Code Data:', event.data);

    try {
      const parsedData: QRCodeData = JSON.parse(event.data);

      // Define API endpoint and correct payload
      const apiUrl = API_ENDPOINTS.PAY_SEATS_QR;
      const payload = {
        dispatch_id: parsedData.dispatch_id, // Ensure this field is present in the QR data
        wallet_id: parsedData.wallet_id,
      };

      // Send transaction request
      const response = await post(apiUrl, payload, true);
      console.log('API Response:', response);

      // Handle response
      if (response.status) {
        Alert.alert('Success', 'Transaction completed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Transaction Error:', error);
      Alert.alert('Error', 'Invalid QR Code data. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* QR Scanner */}
      <QRCodeScanner
        onRead={handleQRCodeRead}
        flashMode={RNCamera.Constants.FlashMode.auto}
        reactivate={true}
        reactivateTimeout={2000}
        showMarker={true}
        markerStyle={styles.marker}
        cameraStyle={styles.camera}
      />

      {/* Overlay Text */}
      <Text style={styles.description}>
        Align the QR code within the frame to scan.
      </Text>
    </View>
  );
};

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
});

export default ScanQRScreen;
