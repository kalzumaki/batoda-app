import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get, post} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import SuccessAlertModal from '../../components/SuccessAlertModal';
import CustomAlertModal from '../../components/CustomAlertModal';
import ErrorAlertModal from '../../components/ErrorAlertModal';

const SEAT_POSITIONS = [
  ['back_small_1', 'front_small_1', 'front_small_2'],
  ['back_small_2', 'front_big_1', 'front_big_2'],
];

const formatSeatName = (seat: string) => {
  return seat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ReserveRideScreen: React.FC = () => {
  const route = useRoute();
  const {dispatchId, tricycleNumber} = route.params as {
    dispatchId: number;
    tricycleNumber: number;
  };

  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');
  const [responseSuccessMessage, setResponseSuccessMessage] = useState('');
  const fetchReservedSeats = async () => {
    try {
      if (!dispatchId) return;

      const seatResponse = await get(
        `${API_ENDPOINTS.DISPLAY_SEATS}?dispatch_id=${dispatchId}`,
      );

      const approvedResponse = await get(
        API_ENDPOINTS.DISPLAY_APPROVED_DISPATCH_BY_ID.replace(
          '{id}',
          String(dispatchId),
        ),
      );

      if (seatResponse.status && approvedResponse.status) {
        const reserved = [
          ...seatResponse.reserved_seats.map(
            (seat: {seat_position: string}) => seat.seat_position,
          ),
          ...(approvedResponse.dispatch?.seat_position || []),
        ];
        setReservedSeats(reserved);
        await AsyncStorage.setItem('reservedSeats', JSON.stringify(reserved));
      }
    } catch (error) {
      console.error('Error fetching reserved seats:', error);
    }
  };

  useEffect(() => {
    if (dispatchId !== null) {
      fetchReservedSeats();
    }
  }, [dispatchId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservedSeats().finally(() => setRefreshing(false));
  };

  const toggleSeatSelection = (seat: string) => {
    if (reservedSeats.includes(seat)) return;

    setSelectedSeats(prevSeats => {
      if (multiSelectEnabled) {
        return prevSeats.includes(seat)
          ? prevSeats.filter(s => s !== seat)
          : [...prevSeats, seat];
      } else {
        return prevSeats.includes(seat) ? [] : [seat];
      }
    });
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    setCountdown(120);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(countdownRef.current!);
          return null;
        }
      });
    }, 1000);
  };

  const confirmReservation = () => {
    if (selectedSeats.length === 0) return;

    if (!dispatchId) {
      Alert.alert(
        'No Approved Dispatch',
        'No approved drivers waiting for dispatch.',
      );
      return;
    }

    setShowConfirmModal(true);
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Back Arrow */}
      <BackButton />

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {/* <Text style={styles.title}>Reserve Ride</Text> */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Dispatch Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dispatch ID:</Text>
            <Text style={styles.infoValue}>{dispatchId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tricycle No:</Text>
            <Text style={styles.infoValue}>{tricycleNumber}</Text>
          </View>
        </View>

        <View style={[styles.card, {alignSelf: 'center'}]}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Multi-Select</Text>
            <Switch
              value={multiSelectEnabled}
              onValueChange={value => {
                setMultiSelectEnabled(value);
                if (!value) setSelectedSeats([]);
              }}
            />
          </View>
          {countdown !== null && (
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'red'}}>
              Payment expires in: {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, '0')}
            </Text>
          )}
          <View style={styles.seatGrid}>
            {SEAT_POSITIONS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map(seat => (
                  <TouchableOpacity
                    key={seat}
                    style={[
                      styles.seat,
                      reservedSeats.includes(seat)
                        ? styles.reserved
                        : selectedSeats.includes(seat)
                        ? styles.selected
                        : null,
                    ]}
                    onPress={() => toggleSeatSelection(seat)}
                    disabled={reservedSeats.includes(seat)}>
                    <Image
                      source={require('../../assets/2.png')}
                      style={styles.icon}
                    />
                    <Text style={styles.seatLabel}>{formatSeatName(seat)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          {selectedSeats.length > 0 && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmReservation}>
              <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
            </TouchableOpacity>
          )}
        </View>
        <CustomAlertModal
          visible={showConfirmModal}
          title="Confirm Reservation"
          message="Complete the payment within 2 minutes, or your reservation will be canceled automatically."
          boldParts={['2 minutes']}
          isLoading={isReserving}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            setIsReserving(true);
            try {
              const response = await post(
                API_ENDPOINTS.RESERVE_SEAT,
                {
                  dispatch_id: dispatchId,
                  seat_position: selectedSeats,
                },
                true,
              );

              if (response.status) {
                setReservedSeats(prevSeats => [
                  ...new Set([...prevSeats, ...response.reserved_seats]),
                ]);
                setSelectedSeats([]);
                startCountdown();
                setResponseSuccessMessage(response.message);
                setShowSuccessModal(true);

                setShowConfirmModal(false);
              } else {
                // Alert.alert('Reservation Error', response.message);
                setResponseErrorMessage(response.message);
                setShowConfirmModal(false);
                setShowErrorModal(true);
                await fetchReservedSeats();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reserve seats.');
              <ErrorAlertModal
                visible={showErrorModal}
                title="Error"
                message="Failed to reserve seats."
                onDismiss={() => setShowErrorModal(false)}
              />;
            } finally {
              setIsReserving(false);
            }
          }}
        />
        <SuccessAlertModal
          visible={showSuccessModal}
          title="Success!"
          message="Your reservation has been completed."
          onDismiss={() => setShowSuccessModal(false)}
        />
        <ErrorAlertModal
          visible={showErrorModal}
          title="Failed to Reserve Seats"
          message={responseErrorMessage}
          onDismiss={() => setShowErrorModal(false)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: 20, backgroundColor: '#fff'},
  backButton: {position: 'absolute', top: 20, left: 20, zIndex: 10},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    elevation: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleLabel: {fontSize: 14, marginRight: 10, color: 'black'},
  seatGrid: {alignItems: 'center'},
  row: {flexDirection: 'row', justifyContent: 'center', marginBottom: 10},
  seat: {
    width: 90,
    height: 90,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  selected: {backgroundColor: '#62a287'},
  reserved: {backgroundColor: '#a3a3a3'},
  icon: {width: 40, height: 40, resizeMode: 'contain'},
  seatLabel: {marginTop: 5, fontSize: 12, textAlign: 'center'},
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  infoCard: {
    backgroundColor: '#469c8f',
    padding: 20,
    marginVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    alignItems: 'center',
    width: '90%',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
  },

  infoLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '900',
  },
});
export default ReserveRideScreen;
