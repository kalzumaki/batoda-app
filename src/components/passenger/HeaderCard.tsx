import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const HeaderMain: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Image source={require('../../assets/profile-user.png')} style={styles.profileIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../../assets/menu.png')} style={styles.drawerIcon} />
        </TouchableOpacity>
      </View>

      {/* Dispatching Status */}
      <Text style={styles.statusText}>Dispatching Now...</Text>

      {/* Main Content: Tricycle Number, Date, Route, Time */}
      <View style={styles.mainContent}>
        <View style={styles.tricycleContainer}>
          <Text style={styles.tricycleNumber}>123</Text>
          <Text style={styles.tricycleLabel}>Tricycle Number</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Today</Text>
            <Text style={styles.infoValue}>Oct. 08, 2024</Text>
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Route</Text>
            <Text style={styles.infoValue}>Dumaguete ➔ Bacong</Text>
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Time Left</Text>
            <Text style={styles.infoValue}>00 : 10 : 00</Text>
            <Text style={styles.timeUnit}>hr     min     sec</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2d665f',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%', // Full width
    marginHorizontal: 0, // Remove any default margins
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  drawerIcon: {
    width: 30,
    height: 30,
  },
  statusText: {
    fontSize: 18,
    color: '#C6D9D7',
    marginTop: 10,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tricycleContainer: {
    alignItems: 'center',
  },
  tricycleNumber: {
    fontSize: 72,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tricycleLabel: {
    fontSize: 16,
    color: '#C6D9D7',
  },
  infoContainer: {
    justifyContent: 'center',
  },
  infoTextContainer: {
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    color: '#A8BAB7',
  },
  infoValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeUnit: {
    fontSize: 12,
    color: '#C6D9D7',
    marginTop: 5,
  },
});

export default HeaderMain;
