import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SectionList,
  Image,
} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {STORAGE_API_URL} from '@env';
import {DispatcherQrResponse} from '../../types/qr'; // Assuming the interface is correctly imported
import BackButton from '../../components/BackButton';
import SuccessAlertModal from '../../components/SuccessAlertModal';
import useSocketListener from '../../hooks/useSocketListener';

const ScanQRForDrivers: React.FC = () => {
  const [dispatches, setDispatches] = useState<DispatcherQrResponse['data']>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [showResponseMessage, setShowResponseMessage] = useState('');

  const fetchPassengerQRCodes = async () => {
    try {
      const response: DispatcherQrResponse = await get(
        API_ENDPOINTS.GET_DRIVER_QR,
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
  useEffect(() => {
    fetchPassengerQRCodes();
  }, []);
  const handleQrFresh = useCallback((data: any) => {
    console.log('Payment Received from Driver');
    setShowResponseMessage('QR Payment Success check your Daily Income');
    setSuccessModalVisible(true);
    setSelectedQR(null);
    fetchPassengerQRCodes();
  }, []);
  useSocketListener('dispatcher-paid', handleQrFresh);
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading passenger QR codes...</Text>
      </View>
    );
  }

  // Format the data for SectionList
  const sections = dispatches.map(dispatch => ({
    title: `Dispatch ID: ${dispatch.dispatch_id}\n`,
    data: [dispatch], // Wrap the dispatch in an array as data for SectionList
  }));

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.screenTitle}>Scan QR for Drivers</Text>

      {dispatches.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No Reservations found for this Driver.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.dispatch_id.toString() + index}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                setSelectedQR(`${STORAGE_API_URL}/storage/${item.qr_code}`)
              }>
              <View style={styles.cardHeader}>
                <Image
                  source={
                    item.driver.profile
                      ? {
                          uri: `${STORAGE_API_URL}/storage/${item.driver.profile}`,
                        }
                      : require('../../assets/25.png')
                  }
                  style={styles.profileImage}
                />
                <View style={styles.cardText}>
                  <Text style={styles.passengerName}>
                    {item.driver.full_name}
                  </Text>
                  <Text style={styles.seatText}>
                    Tricycle Number: {item.driver.tricycle_number}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.dispatchTitle}>{title}</Text>
          )}
        />
      )}

      <Modal
        transparent
        visible={selectedQR !== null}
        animationType="fade"
        onRequestClose={() => setSelectedQR(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedQR(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedQR && (
                <SvgUri uri={selectedQR} width={250} height={250} />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <SuccessAlertModal
        visible={isSuccessModalVisible}
        title="Payment Successful"
        message={showResponseMessage}
        onDismiss={() => setSuccessModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  dispatchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  seatText: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  profileImage: {
    width: 100,
    height: 100,
    marginRight: 12,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#62a287', // Or any accent color you like
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: {
    flex: 1,
  },
});

export default ScanQRForDrivers;
