import React, {useEffect, useState} from 'react';
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
import {PassengerQRResponse} from '../../types/qr';
import BackButton from '../../components/BackButton';

const ScanQRForPassengers: React.FC = () => {
  const [dispatches, setDispatches] = useState<PassengerQRResponse['data']>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

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

  // Format the data for SectionList
  const sections = dispatches.map(dispatch => ({
    title: `Reservation ID: ${dispatch.reservation_id}\n\nDispatcher: ${dispatch.dispatcher_full_name}\n`,

    data: [dispatch],
  }));

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.screenTitle}>Scan QR for Passengers</Text>

      {dispatches.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No Reservations found for this Driver.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.user_id.toString() + index}
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
                    item.profile_picture
                      ? {
                          uri: `${STORAGE_API_URL}/storage/${item.profile_picture}`,
                        }
                      : require('../../assets/25.png')
                  }
                  style={styles.profileImage}
                />
                <View style={styles.cardText}>
                  <Text style={styles.passengerName}>{item.full_name}</Text>
                  <Text style={styles.seatText}>Seats:</Text>
                  {item.seat_positions.map((seat: any, idx) => {
                    const formattedSeat: string = seat
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(' ');
                    return (
                      <Text key={idx} style={styles.seatText}>
                        • {formattedSeat}
                      </Text>
                    );
                  })}
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

export default ScanQRForPassengers;
