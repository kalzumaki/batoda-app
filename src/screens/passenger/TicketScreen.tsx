import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {get, post} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {Ticket} from '../../types/ticket';
import ReceiptDownloader from '../../components/passenger/ReceiptDownloader';

const TicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

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
  const handlePayNow = async () => {
    try {
      setButtonLoading(true);
      await processPayment();
    } finally {
      setButtonLoading(false); // Hide button loading after process
    }
  };
  const processPayment = async () => {
    if (!ticket || !ticket.dispatch_id) {
      Alert.alert('Error', 'No dispatch ID found.');
      return;
    }

    try {
      // Fetch the user's e-wallet balance
      const walletResponse = await get(API_ENDPOINTS.SHOW_EWALLET);

      if (!walletResponse.status) {
        Alert.alert('Error', 'Failed to retrieve wallet details.');
        return;
      }

      const balance = parseFloat(walletResponse.data.balance); // Convert balance to number

      if (balance < ticket.total_price) {
        Alert.alert(
          'Insufficient Balance',
          `Your balance is ₱${balance}, but the ticket costs ₱${ticket.total_price}. Please top up.`,
        );
        return; // Stop the transaction if balance is insufficient
      }

      // Proceed with payment confirmation
      Alert.alert(
        'Confirm Payment',
        'Are you sure you want to proceed with this payment?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: async () => {
              setLoading(true);
              try {
                const response = await post(
                  API_ENDPOINTS.PAY_SEATS,
                  {dispatch_id: ticket.dispatch_id},
                  true,
                );

                if (response.status) {
                  Alert.alert('Success', 'Seat paid successfully!', [
                    {text: 'OK', onPress: () => setRefreshing(prev => !prev)},
                  ]);
                } else {
                  Alert.alert('Error', 'Failed to pay the seat.');
                }
              } catch (error) {
                console.error('Failed to reserve seat:', error);
                Alert.alert(
                  'Error',
                  'An error occurred while reserving the seat.',
                );
              } finally {
                setLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      Alert.alert('Error', 'Failed to fetch wallet details.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reload ticket details or fetch latest data
      fetchTicket();
    }, [refreshing]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
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
            {/* Ticket Content */}
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
                <Text style={styles.detailLabel}>Total Amount To Pay</Text>
                <Text style={styles.detailValue}>
                  ₱{ticket.total_price ? ticket.total_price.toFixed(2) : '0.00'}
                </Text>
              </View>
              {ticket?.status === 'reserved' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Payment Sent</Text>
                  <Text style={styles.detailValue}>
                    ₱
                    {ticket.total_price
                      ? ticket.total_price.toFixed(2)
                      : '0.00'}
                  </Text>
                </View>
              )}
            </View>

            {/* Reference Number and Date */}
            <View style={styles.footer}>
              <Text style={styles.refNumber}>
                Ref No: {ticket.reference_no}
              </Text>
              <Text style={styles.dateText}>
                {new Date(ticket.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        {/* Buttons Container - Positioned Outside */}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {/* Download Button - Bottom Left */}
        {ticket?.status === 'reserved' && <ReceiptDownloader dispatchId={ticket.dispatch_id} />}

        {/* Pay Here Button - Bottom Center */}
        {ticket?.status === 'unpaid' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayNow}
            disabled={buttonLoading} // Only this button is disabled when loading
          >
            <Text style={styles.payButtonText}>
              {buttonLoading ? 'Processing...' : 'Pay Here'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  //   downloadButton: {
  //     marginTop: 20,
  //     alignItems: 'center',
  //   },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'space-between', // Pushes the button to the bottom
    paddingBottom: 100, // Ensures space for the buttons
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20, // Ensures buttons stay above the bottom edge
    left: 0,
    right: 0,
    paddingVertical: 10,
  },

  downloadButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  payButton: {
    backgroundColor: 'green',
    // marginTop: 50,
    marginLeft: 180,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});

export default TicketScreen;
