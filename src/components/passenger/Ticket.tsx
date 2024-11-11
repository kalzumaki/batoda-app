import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Ticket: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('TicketScreen'); // Navigate to ticketScreen when clicked
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.ticketContent}>
        <Text style={styles.ticketLabel}>Your Ticket Number</Text>
        <View style={styles.ticketNumberContainer}>
          <Text style={styles.ticketNumber}>RA 1</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d665f', // Matches the color from your design
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketContent: {
    width: '100%',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  ticketNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Ticket;
