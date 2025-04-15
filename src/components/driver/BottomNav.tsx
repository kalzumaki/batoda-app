import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {post, postWithoutPayload} from '../../utils/proxy';
import {Alert} from 'react-native';
import {DispatchRequestResponse} from '../../types/approved-dispatch';
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const BottomNav: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRequestDispatch = async () => {
    setLoading(true); // Set loading state before making the request
    try {
      const response: DispatchRequestResponse = await postWithoutPayload(
        API_ENDPOINTS.REQUEST_DISPATCH,
        true,
      );

      console.log('Dispatch request response:', response);
      if (response?.status) {
        Alert.alert('Success', 'Dispatch request sent successfully!');
      } else {
        Alert.alert(
          'Error',
          response?.message ||
            'Failed to send dispatch request. Please try again.',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Failed to send dispatch request. Please try again.',
      );
    } finally {
      setLoading(false); // End loading state after request is completed
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('ScanQRForPassengers')}>
        <Icon name="people-outline" size={24} color="#000" />
        <Text style={styles.label}>Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('TravelHistoryForDrivers')}>
        <Icon name="calendar-outline" size={24} color="#000" />
        <Text style={styles.label}>History</Text>
      </TouchableOpacity>

      <View style={styles.requestContainer}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestDispatch}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <Icon name="add-outline" size={32} color="#000" />
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('ScanQR')}>
        <Icon name="qr-code-outline" size={24} color="#000" />
        <Text style={styles.label}>QR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('UploadValidId')}>
        <Icon name="card-outline" size={24} color="#000" />
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
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#000',
  },
  requestContainer: {
    position: 'absolute',
    bottom: 40,
    left: '41%',
    alignSelf: 'center',
  },
  requestButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BottomNav;
