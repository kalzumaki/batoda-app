import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_ENDPOINTS } from '../../api/api-endpoints';
import { get } from '../../utils/proxy';
import { STORAGE_API_URL } from '@env';
import { PassengerQRResponse } from '../../types/qr';

const ScanQRForPassengers: React.FC = () => {
  const [dispatches, setDispatches] = useState<PassengerQRResponse['data']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassengerQRCodes = async () => {
      try {
        const response: PassengerQRResponse = await get(
          API_ENDPOINTS.GET_PASSENGER_QR,
        );
        if (response.status && response.data) {
          setDispatches(response.data);
        } else {
          setDispatches([]);
        }
      } catch (error) {
        console.error('Failed to fetch passenger QR codes:', error);
        setDispatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPassengerQRCodes();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading passenger QR codes...</Text>
      </View>
    );
  }

  if (dispatches.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Reservations found for this Driver.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Scan QR for Passengers</Text>
      {dispatches.map((dispatch) => (
        <View key={dispatch.dispatch_id} style={styles.dispatchBlock}>
          <Text style={styles.dispatchTitle}>
            Dispatch #{dispatch.dispatch_id}
          </Text>
          {dispatch.passengers.map((passenger) => (
            <View key={passenger.user_id} style={styles.passengerBlock}>
              <Text style={styles.passengerName}>{passenger.full_name}</Text>
              <WebView
                source={{
                  uri: `${STORAGE_API_URL}/storage/${passenger.qr_code}`,
                }}
                style={styles.qrWebview}
                originWhitelist={['*']}
                scrollEnabled={false} 
                scalesPageToFit={false}
              />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dispatchBlock: {
    marginBottom: 24,
    width: '100%',
  },
  dispatchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  passengerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  passengerName: {
    fontSize: 16,
    marginBottom: 6,
  },
  qrWebview: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScanQRForPassengers;
