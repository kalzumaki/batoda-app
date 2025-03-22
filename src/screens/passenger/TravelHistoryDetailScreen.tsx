import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {Transaction} from '../../types/transaction'; // Import Transaction type
import {TravelHistory} from '../../types/travel-history'; // Import TravelHistory type
import BackButton from '../../components/BackButton'; // Import the BackButton component

type TravelHistoryDetailRouteProp = RouteProp<
  RootStackParamList,
  'TravelHistoryDetail'
>;

const TravelHistoryDetailScreen: React.FC = () => {
  const route = useRoute<TravelHistoryDetailRouteProp>();
  const {item}: {item: Transaction | TravelHistory} = route.params; // The item passed through navigation

  // Type Guard: Check if the item is a Transaction (it will have 'receipt')
  const isTransaction = (
    item: Transaction | TravelHistory,
  ): item is Transaction => {
    return (item as Transaction).receipt !== undefined;
  };
  const formatSeatName = (seat: string) => {
    return seat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Travel History Details</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reference No:</Text>
          <Text style={styles.cardText}>{item.reference_no}</Text>

          <Text style={styles.cardTitle}>Tricycle No:</Text>
          <Text style={styles.cardText}>{item.tricycle_number}</Text>

          <Text style={styles.cardTitle}>Date & Time:</Text>
          <Text style={styles.cardText}>
            {item.date} at {item.time}
          </Text>

          {/* Conditional rendering based on the type of the item */}
          {isTransaction(item) ? (
            <>
              <Text style={styles.cardTitle}>Amount:</Text>
              <Text style={styles.cardText}>₱{item.amount}</Text>

              <Text style={styles.cardTitle}>Transaction Receipt:</Text>
              <Text style={styles.cardText}>Driver: {item.receipt.driver}</Text>
              <Text style={styles.cardText}>
                Passenger: {item.receipt.passenger}
              </Text>
              <Text style={styles.cardText}>
                Total Cost: ₱{item.receipt.total_cost}
              </Text>

              <Text style={styles.cardTitle}>Seats Reserved:</Text>
              <View style={styles.seatList}>
                {item.receipt.seats_reserved.map(
                  (seat: string, index: number) => (
                    <Text key={index} style={styles.seatItem}>
                      {formatSeatName(seat)}
                    </Text>
                  ),
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Status:</Text>
              <Text style={[styles.cardText, {color: 'red', fontWeight: 'bold',}]}>
                {item.status.toLocaleUpperCase()}
              </Text>

              <Text style={styles.cardTitle}>Number of Seats Available:</Text>
              <Text style={styles.cardText}>{item.number_of_seats_avail}</Text>

              {/* <Text style={styles.cardTitle}>Tricycle ID:</Text>
              <Text style={styles.cardText}>{item.tricycle_id}</Text> */}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#f0f0f0', // Subtle light gray background for contrast
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40, // Ensures some space between the BackButton and title
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d665f', // Green accent for the title
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 5, // Softer shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 14,
  },
  seatList: {
    marginVertical: 12,
  },
  seatItem: {
    fontSize: 14,
    color: '#2d665f', // Green text for seat items
    marginVertical: 4,
  },
});

export default TravelHistoryDetailScreen;
