import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {get, post} from '../../utils/proxy';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import {DispatchResponse} from '../../types/approved-dispatch';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const ApprovedDispatches: React.FC = () => {
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [dispatchId, setDispatchId] = useState<number | null>(null);

  const fetchPassengerCount = async () => {
    try {
      const data: DispatchResponse = await get(API_ENDPOINTS.PASSENGER_COUNT);
      if (data.dispatches?.length > 0) {
        setPassengerCount(data.dispatches[0].passenger_count);
      } else {
        setPassengerCount(0);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch passenger count.');
    }
  };

  useEffect(() => {
    fetchPassengerCount();
    const handleEvent = (event: PusherEvent) => {
      if (['DispatchUpdated', 'DispatchFinalized'].includes(event.eventName)) {
        fetchPassengerCount();
      }
    };
    initPusher().then(() => subscribeToChannel('dispatches', handleEvent));
    return () => unsubscribeFromChannel('dispatches', handleEvent);
  }, []);

  const toggleSeatSelection = (seat: string) => {
    if (reservedSeats.includes(seat)) return; // Prevent selecting reserved seats
    setSelectedSeats(prev =>
      multiSelectEnabled
        ? prev.includes(seat)
          ? prev.filter(s => s !== seat)
          : [...prev, seat]
        : [seat],
    );
  };

  const fetchApprovedSeats = async () => {
    try {
      const response = await get(API_ENDPOINTS.DISPLAY_APPROVED_SEATS);

      if (response.status) {
        console.log('Approved seats response:', response.dispatches);

        // Extract all reserved seat positions
        const reserved = response.dispatches.flatMap(
          (dispatch: any) => dispatch.seat_position || [],
        );

        setReservedSeats(reserved);
        await AsyncStorage.setItem('reservedSeats', JSON.stringify(reserved));

        // Get the first dispatch_id
        if (response.dispatches.length > 0) {
          setDispatchId(response.dispatches[0].id);
        }
      } else {
        console.warn('No approved seats available.');
      }
    } catch (error) {
      console.error('Error fetching approved seats:', error);
    }
  };
  const loadReservedSeats = async () => {
    const storedSeats = await AsyncStorage.getItem('reservedSeats');
    if (storedSeats) {
      setReservedSeats(JSON.parse(storedSeats));
    }
  };

  useEffect(() => {
    loadReservedSeats();
    fetchApprovedSeats();
  }, []);

  // Confirm reservation using fetched dispatch_id
  const confirmReservation = async () => {
    if (selectedSeats.length === 0 || !dispatchId) return;

    try {
      const payload = {
        dispatch_id: dispatchId, // Automatically retrieved from the backend
        seat_position: selectedSeats,
      };

      console.log('Sending reservation payload:', payload);
      const response = await post(API_ENDPOINTS.RESERVE_SEAT, payload, true);

      if (response.status) {
        setReservedSeats(response.reserved_seats);
        setSelectedSeats([]);
        Alert.alert('Success', response.message);
      } else {
        Alert.alert('Error', 'Reservation failed.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert('Error', 'Failed to reserve seats.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seat Reservation</Text>

      {/* Card Background */}
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

        <View style={styles.seatGrid}>
          {SEAT_POSITIONS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((seat: string) => {
                const isReserved = reservedSeats.includes(seat);
                const isSelected = selectedSeats.includes(seat);

                return (
                  <TouchableOpacity
                    key={seat}
                    style={[
                      styles.seat,
                      isReserved
                        ? styles.reserved
                        : isSelected
                        ? styles.selected
                        : null,
                    ]}
                    onPress={() => toggleSeatSelection(seat)}
                    disabled={isReserved}>
                    <Image
                      source={require('../../assets/2.png')}
                      style={styles.icon}
                    />
                    <Text style={styles.seatLabel}>{formatSeatName(seat)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Confirm Reservation Button (Shown Only When a Seat is Selected) */}
        {selectedSeats.length > 0 && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmReservation}>
            <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
          </TouchableOpacity>
        )}
      </View>
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleLabel: {fontSize: 14, marginRight: 10, color: 'black'},
  seatGrid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  seat: {
    width: 90,
    height: 90,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ApprovedDispatches;
