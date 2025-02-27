import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {get} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {Ticket} from '../../types/ticket';

const TicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    try {
      const ticketResponse = await get(API_ENDPOINTS.DISPLAY_TICKET);

      if (ticketResponse.status) {
        const fetchedTicket: Ticket = ticketResponse.ticket;
        setTicket(fetchedTicket);
        setError(null);

        // Fetch ticket price
        const ticketId = fetchedTicket.id;
        const priceEndpoint = API_ENDPOINTS.DISPLAY_QUANTITY_AMOUNT.replace(
          '{id}',
          ticketId,
        );
        const priceResponse = await get(priceEndpoint);

        if (priceResponse.status) {
          setTicket((prevTicket: any) =>
            prevTicket
              ? {...prevTicket, total_price: priceResponse.total_price}
              : prevTicket,
          );
        } else {
          setError('Failed to fetch ticket price');
        }
      } else {
        setError('Failed to fetch ticket details');
      }
    } catch (err) {
      setError('An error occurred while fetching the ticket');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTicket();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header with Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {error || !ticket ? (
        <View style={styles.ticketContainer}>
          <Text style={styles.errorText}>{error || 'No ticket found'}</Text>
        </View>
      ) : (
        <View style={styles.ticketContainer}>
          <Icon
            name={
              ticket.status === 'reserved'
                ? 'check-circle'
                : ticket.status === 'cancelled'
                ? 'cancel'
                : 'error'
            }
            size={50}
            color={
              ticket.status === 'reserved'
                ? 'green'
                : ticket.status === 'cancelled'
                ? 'red'
                : 'orange'
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  ticket.status === 'reserved'
                    ? 'green'
                    : ticket.status === 'cancelled'
                    ? 'red'
                    : 'orange',
              },
            ]}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Text>
          <Text style={styles.subText}>
            Your reservation status is {ticket.status}!
          </Text>

          {/* Ticket Number */}
          <Text style={styles.ticketLabel}>Your Ticket Number is</Text>
          <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>

          {/* Ticket Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dispatch ID:</Text>
              <Text style={styles.detailValue}>{ticket.dispatch_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tricycle No.</Text>
              <Text style={styles.detailValue}>{ticket.tricycle_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Number of seats avail</Text>
              <Text style={styles.detailValue}>
                {ticket.number_of_seats_avail}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={styles.detailValue}>
                ₱{ticket.total_price ? ticket.total_price.toFixed(2) : '0.00'}
              </Text>
            </View>
            {ticket?.status === 'reserved' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Payment Sent</Text>
                <Text style={styles.detailValue}>
                  ₱{ticket.total_price ? ticket.total_price.toFixed(2) : '0.00'}
                </Text>
              </View>
            )}
          </View>

          {/* Reference Number and Date */}
          <View style={styles.footer}>
            <Text style={styles.refNumber}>Ref No: {ticket.reference_no}</Text>
            <Text style={styles.dateText}>
              {new Date(ticket.created_at).toLocaleString()}
            </Text>
          </View>

          {/* Download Button */}
          <TouchableOpacity style={styles.downloadButton}>
            <Icon name="file-download" size={24} color="green" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  ticketContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
  },
  icon: {
    marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  ticketLabel: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  ticketNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: 'gray',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  refNumber: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  downloadButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default TicketScreen;
