import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TicketScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Ticket Details */}
      <View style={styles.ticketContainer}>
        <Icon name="check-circle" size={50} color="green" style={styles.icon} />
        <Text style={styles.statusText}>Reserved</Text>
        <Text style={styles.subText}>Your reservation was successful!</Text>

        {/* Ticket Number */}
        <Text style={styles.ticketLabel}>Your Ticket Number is</Text>
        <Text style={styles.ticketNumber}>RA 1</Text>

        {/* Ticket Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tricycle No.</Text>
            <Text style={styles.detailValue}>123</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number of seats avail</Text>
            <Text style={styles.detailValue}>1</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.detailValue}>₱20.00</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Payment Sent</Text>
            <Text style={styles.detailValue}>₱20.00</Text>
          </View>
        </View>

        {/* Reference Number and Date */}
        <View style={styles.footer}>
          <Text style={styles.refNumber}>Ref No: B94587945845</Text>
          <Text style={styles.dateText}>Oct. 08, 2024 8:30 AM</Text>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton}>
          <Icon name="file-download" size={24} color="green" />
        </TouchableOpacity>
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
    color: 'green',
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
});

export default TicketScreen;
