import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {RootStackParamList} from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const BottomNav: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('ScanQRForDrivers')}>
        <FontAwesomeIcon name="qrcode" size={24} color="#000" />
        <Text style={styles.label}>QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('TravelHistoryForDispatchers')}>
        <FontAwesomeIcon name="history" size={24} color="#000" />
        <Text style={styles.label}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('UploadValidId')}>
        <FontAwesomeIcon name="id-card" size={24} color="#000" />
        <Text style={styles.label}>ID</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#DDD8D8',
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#000',
  },
});

export default BottomNav;
