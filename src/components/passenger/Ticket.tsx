import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {get} from '../../utils/proxy';
import {
  RefreshTriggerProp,
  RootStackParamList,
} from '../../types/passenger-dashboard';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';
import {
  initPusher,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../pusher/pusher';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Ticket: React.FC<RefreshTriggerProp> = ({refreshTrigger}) => {
  const navigation = useNavigation<NavigationProps>();
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await get(API_ENDPOINTS.DISPLAY_TICKET);

      if (response.status && response.ticket) {
        setTicketNumber(response.ticket.ticket_number);
      } else {
        setTicketNumber(null);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [refreshTrigger]);

  useEffect(() => {
    console.log('Subscribing to user-specific channel...');

    const onEvent = (event: PusherEvent) => {
      console.log('Event received:', event);

      if (
        event.eventName === 'UnpaidTicketFetched' ||
        event.eventName === 'DispatchUpdated' ||
        event.eventName === 'DispatchFinalized'
      ) {
        console.log('Broadcast received, fetching new ticket data...');
        fetchTicket();
      }
    };

    const subscribeToDisplayTicket = async () => {
      try {
        await initPusher();
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await subscribeToChannel(`user.${userId}`, onEvent);
          console.log(`Subscribed to user.${userId} channel.`);
        } else {
          console.warn('No user ID found for subscription.');
        }
      } catch (error) {
        console.error('Error subscribing to user-specific channel:', error);
      }
    };

    subscribeToDisplayTicket();

    return () => {
      const unsubscribeFromDisplayTicket = async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            await unsubscribeFromChannel(`user.${userId}`, onEvent);
            console.log(`Unsubscribed from user.${userId} channel.`);
          }
        } catch (error) {
          console.error(
            'Error unsubscribing from user-specific channel:',
            error,
          );
        }
      };

      unsubscribeFromDisplayTicket();
    };
  }, [refreshTrigger]);

  const handlePress = () => {
    navigation.navigate('TicketScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.ticketLabel}>Your Ticket Number</Text>

      <TouchableOpacity
        style={[styles.ticketBox, !ticketNumber && styles.disabledTicketBox]}
        onPress={handlePress}
        disabled={!ticketNumber}>
        <View style={styles.ticketContent}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : ticketNumber ? (
            <>
              <Text style={styles.ticketNumber}>{ticketNumber}</Text>
              <Text style={styles.arrow}>→</Text>
            </>
          ) : (
            <Text style={styles.noTicketText}>No ticket available</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    marginHorizontal: 10,
  },
  ticketLabel: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    textAlign: 'left',
  },
  ticketBox: {
    backgroundColor: '#2d665f',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  ticketContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  noTicketText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    flex: 1,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledTicketBox: {
    backgroundColor: '#2d665f', // Gray out the box when disabled
  },
});

export default Ticket;
