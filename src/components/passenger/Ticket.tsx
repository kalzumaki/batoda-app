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

import AsyncStorage from '@react-native-async-storage/async-storage';
import useSocketListener from '../../hooks/useSocketListener';
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


  const handleDispatchUpdated = useCallback((data: any) => {
    console.log('Ticket Updated:', data);
    fetchTicket();
  }, []);
  useSocketListener('user-unpaid-ticket-updated', handleDispatchUpdated);
  useSocketListener('dispatch-finalized', handleDispatchUpdated);

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
    backgroundColor: '#2d665f',
  },
});

export default Ticket;
