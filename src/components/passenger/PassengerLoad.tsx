import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import { get } from '../../utils/proxy';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import { DispatchResponse } from '../../types/approved-dispatch';
import { API_ENDPOINTS } from '../../api/api-endpoints';
import { PusherEvent } from '@pusher/pusher-websocket-react-native';

const MAX_PASSENGERS = 6;


const SEAT_NAMES = {
  front_small_1: 'Front Small Seat 1',
  front_small_2: 'Front Small Seat 2',
  front_big_2: 'Front Big Seat 2',
  front_big_1: 'Front Big Seat 1',
  back_small_2: 'Back Small Seat 2',
  back_small_1: 'Back Small Seat 1',
};

type SeatKey = keyof typeof SEAT_NAMES;

const SEAT_POSITIONS: SeatKey[] = [
  'front_small_1',
  'front_small_2',
  'front_big_2',
  'front_big_1',
  'back_small_2',
  'back_small_1',
];

const ApprovedDispatches: React.FC = () => {
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SeatKey[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPassengerCount = async () => {
    try {
      console.log('Fetching Passenger Count:');
      const data: DispatchResponse = await get(API_ENDPOINTS.PASSENGER_COUNT);
      console.log('Fetched Data:', JSON.stringify(data));

      if (data.dispatches && data.dispatches.length > 0) {
        setPassengerCount(data.dispatches[0].passenger_count);
        setError(null);
      } else {
        setPassengerCount(0);
        console.log('No approved dispatches found.');
      }
    } catch (err) {
      console.error('Error fetching passenger count:', err);
      setError('Failed to fetch passenger count data.');
    }
  };

  useEffect(() => {
    fetchPassengerCount();

    const handleEvent = (event: PusherEvent) => {
      console.log('Event received:', event);
      if (
        event.eventName === 'DispatchUpdated' ||
        event.eventName === 'DispatchFinalized'
      ) {
        console.log('Refreshing data due to event...');
        fetchPassengerCount();
      }
    };

    const subscribeToDispatches = async () => {
      await initPusher();
      await subscribeToChannel('dispatches', handleEvent);
    };

    subscribeToDispatches();

    return () => {
      console.log('Cleaning up Pusher subscription...');
      unsubscribeFromChannel('dispatches', handleEvent);
    };
  }, []);

  const toggleSeatSelection = (seat: SeatKey) => {
    if (multiSelectEnabled) {
      setSelectedSeats(prevSelected =>
        prevSelected.includes(seat)
          ? prevSelected.filter(s => s !== seat)
          : [...prevSelected, seat],
      );
    }
  };

  const resetSelection = () => {
    setSelectedSeats([]);
  };

  const confirmSelection = () => {
    console.log('Selected Seats:', selectedSeats);
    setModalVisible(false);
  };

  const passengers = SEAT_POSITIONS.map(seat => (
    <TouchableOpacity
      key={seat}
      style={[
        styles.iconContainer,
        selectedSeats.includes(seat) ? styles.selected : styles.empty,
      ]}
      onPress={() => toggleSeatSelection(seat)}>
      <Image source={require('../../assets/2.png')} style={styles.icon} />
      <Text style={styles.seatLabel}>{SEAT_NAMES[seat]}</Text>
    </TouchableOpacity>
  ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approved Dispatches</Text>

      {/* Multi-Selection Toggle */}
      <View style={styles.multiSelectToggle}>
        <Text style={styles.toggleLabel}>Enable Multi-Selection</Text>
        <Switch
          value={multiSelectEnabled}
          onValueChange={value => {
            setMultiSelectEnabled(value);
            if (!value) resetSelection(); // Reset selection if disabled
          }}
        />
      </View>

      {/* Seats Display */}
      <View style={styles.passengerIcons}>{passengers}</View>

      {/* Modal for Seat Selection */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Seats</Text>
          <View style={styles.passengerIcons}>{passengers}</View>

          {multiSelectEnabled && selectedSeats.length > 0 && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmSelection}>
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  multiSelectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
  passengerIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    margin: 5,
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
  },
  empty: {
    backgroundColor: '#c6d9d7',
  },
  selected: {
    backgroundColor: '#f0ad4e',
  },
  icon: {
    width: 40,
    height: 40,
  },
  seatLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#62a287',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ApprovedDispatches;
