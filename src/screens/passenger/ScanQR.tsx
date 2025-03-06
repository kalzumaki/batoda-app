import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ScanQRScreen = () => {
  const navigation = useNavigation();

  const handleQRCodeRead = (event: {data: string}) => {
    console.log('QR Code Data:', event.data);
    // Handle QR code scanning logic here
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
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
    backgroundColor: '#1E1E1E', // Match floating nav theme
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
    borderColor: '#00FF00', // Green border
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
