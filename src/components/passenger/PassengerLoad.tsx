import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {get, post} from '../../utils/proxy';
import {DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RefreshTriggerProp} from '../../types/passenger-dashboard';
import CustomAlertModal from '../../components/CustomAlertModal';
import SuccessAlertModal from '../SuccessAlertModal';
import ErrorAlertModal from '../ErrorAlertModal';
import useSocketListener from '../../hooks/useSocketListener';

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

const ApprovedDispatches: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [dispatchId, setDispatchId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');
  const [responseSuccessMessage, setResponseSuccessMessage] = useState('');
  const fetchPassengerCount = async () => {
    try {
      const data: DispatchResponse = await get(API_ENDPOINTS.PASSENGER_COUNT);
      setPassengerCount(data.dispatches?.[0]?.passenger_count || 0);
    } catch {
      console.error('Failed to fetch passenger count.');
    }
  };

  const fetchApprovedSeats = async () => {
    try {
      const response = await get(API_ENDPOINTS.DISPLAY_APPROVED_SEATS);
      console.log('Getting Approved Seats: ', response);
      if (response.status) {
        const reserved = response.dispatches.flatMap(
          (dispatch: any) => dispatch.seat_position || [],
        );
        setReservedSeats(reserved);
        await AsyncStorage.setItem('reservedSeats', JSON.stringify(reserved));
        if (response.dispatches.length > 0) {
          setDispatchId(response.dispatches[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching approved seats:', error);
    }
  };
  useEffect(() => {
    fetchApprovedSeats();
  }, [refreshTrigger]);

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

  const fetchReservedSeats = async () => {
    try {
      if (!dispatchId) return;

      const response = await get(
        `${API_ENDPOINTS.DISPLAY_SEATS}?dispatch_id=${dispatchId}`,
      );

      if (response.status) {
        const reserved = response.reserved_seats.map(
          (seat: {seat_position: string}) => seat.seat_position,
        );
        setReservedSeats(reserved);
        await AsyncStorage.setItem('reservedSeats', JSON.stringify(reserved));
      }
    } catch (error) {
      console.error('Error fetching reserved seats:', error);
    }
  };
  useEffect(() => {
    if (dispatchId) {
      fetchReservedSeats();
    }
  }, [dispatchId]);

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
      setResponseErrorMessage('No approved drivers waiting for dispatch.');
      setShowErrorModal(true);
      return;
    }

    setShowConfirmModal(true);
  };
  const handleApprovedSeats = useCallback((data: any) => {
    console.log('Dispatch updated:', data);
    fetchApprovedSeats();
  }, []);

  const handleReservedSeats = useCallback((data: any) => {
    console.log('Reserved Seats Updated:', data);

    if (data?.seat_positions) {
      const reserved = data.seat_positions;
      setReservedSeats(prevSeats => {
        return [...new Set([...prevSeats, ...reserved])];
      });
    }
  }, []);

  const handleFinalizedSeats = useCallback((data: any) => {
    console.log('Dispatch finalized on seats:', data);

    if (!data.is_dispatched || !data.id) {
      setResponseErrorMessage('No approved drivers waiting for dispatch.');
      setShowErrorModal(true);
      setDispatchId(null);
      fetchApprovedSeats();
    } else {
      setDispatchId(data.id);
      fetchApprovedSeats();
    }
  }, []);

  useSocketListener('seats-reserved', handleReservedSeats);
  useSocketListener('dispatch-updated', handleApprovedSeats);
  useSocketListener('dispatch-finalized', handleFinalizedSeats);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seat Reservation</Text>
      <View style={styles.card}>
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
        <View>
          {countdown !== null && (
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'red'}}>
              Payment expires in: {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>

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
              //   Alert.alert('Reservation Error', response.message);
              setResponseErrorMessage(response.message);
              setShowConfirmModal(false);
              setShowErrorModal(true);
              await fetchReservedSeats();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to reserve seats.');
          } finally {
            setIsReserving(false);
          }
        }}
      />
      <SuccessAlertModal
        visible={showSuccessModal}
        title="Success!"
        message={responseSuccessMessage}
        onDismiss={() => setShowSuccessModal(false)}
      />
      <ErrorAlertModal
        visible={showErrorModal}
        title="Failed to Reserve Seats"
        message={responseErrorMessage}
        onDismiss={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
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
});

export default ApprovedDispatches;
