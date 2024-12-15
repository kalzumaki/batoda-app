import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Ticket: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    navigation.navigate('TicketScreen');
  };

  return (
    <View style={styles.container}>
      {/* Left-aligned text */}
      <Text style={styles.ticketLabel}>Your Ticket Number</Text>

      {/* Clickable ticket */}
      <TouchableOpacity style={styles.ticketBox} onPress={handlePress}>
        <View style={styles.ticketContent}>
          <Text style={styles.ticketNumber}>RA 1</Text>
          <Text style={styles.arrow}>→</Text>
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
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Ticket;
