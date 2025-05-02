import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {post} from '../utils/proxy';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/passenger-dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const eWalletOptions = [
  {label: 'GCash', value: 'GCash', icon: require('../assets/16.png')},
  {
    label: 'Maya',
    value: 'PayMaya',
    icon: require('../assets/Maya_logo.svg.png'),
    disabled: true,
  },
  //   { label: 'Coins.ph', value: 'Coins.ph', disabled: true },
];

const RegisterEwalletScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEwallet, setSelectedEwallet] = useState<string>('GCash');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await post(
        API_ENDPOINTS.REGISTER_EWALLET,
        {bank_name: selectedEwallet},
        true,
      );

      if (response.status) {
        // Fetch the userType from AsyncStorage
        const userTypeString = await AsyncStorage.getItem('userType');
        const userType = userTypeString ? parseInt(userTypeString, 10) : null;

        // Success alert and navigation
        Alert.alert(
          'Success',
          `${selectedEwallet} has been registered successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                switch (userType) {
                  case 6:
                    navigation.replace('DriverDashboard');
                    break;
                  case 7:
                    navigation.replace('DispatcherDashboard');
                    break;
                  case 8:
                    navigation.replace('PassengerDashboard');
                    break;
                  default:
                    Alert.alert('Error', 'Invalid user type.');
                }
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to register e-wallet.',
        );
      }
    } catch (error) {
      //   console.error('❌ Error registering e-wallet:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const renderItem = ({item}: {item: (typeof eWalletOptions)[0]}) => (
    <TouchableOpacity
      style={[styles.dropdownItem, item.disabled && styles.disabledItem]}
      onPress={() => {
        if (!item.disabled) {
          setSelectedEwallet(item.value);
          setDropdownVisible(false);
        }
      }}
      disabled={item.disabled}>
      {item.icon && <Image source={item.icon} style={styles.dropdownIcon} />}
      <Text style={[styles.dropdownText, item.disabled && styles.disabledText]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.navigate('Login')} />
      {/* Title */}
      <Text style={styles.title}>E-Wallet Registration</Text>

      {/* Guidance Message */}
      <Text style={styles.guidanceText}>
        To make your payments smooth, register your preferred e-wallet here.
        This will allow you to use cashless transactions quickly and securely.
      </Text>

      {/* Select E-Wallet */}
      <Text style={styles.description}>
        Please select your e-wallet provider:
      </Text>

      {/* Custom Dropdown */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownVisible(true)}
        disabled={isLoading}>
        {eWalletOptions.find(option => option.value === selectedEwallet)
          ?.icon && (
          <Image
            source={require('../assets/16.png')}
            style={styles.dropdownIcon}
          />
        )}
        <Text style={styles.selectedText}>{selectedEwallet}</Text>
      </TouchableOpacity>

      {/* Notice */}
      <Text style={styles.noticeText}>
        Note: GCash is currently the only available e-wallet. Support for other
        providers is coming soon!
      </Text>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownContainer}>
            <FlatList
              data={eWalletOptions}
              keyExtractor={item => item.value}
              renderItem={renderItem}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.option, isLoading && styles.disabledOption]}
        onPress={handleRegister}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.optionText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 30,
    width: '100%',
    backgroundColor: 'white',
  },
  dropdownIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
  selectedText: {
    fontSize: 16,
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxHeight: 300,
    paddingVertical: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: 'gray',
  },
  option: {
    backgroundColor: '#62a287',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledOption: {
    backgroundColor: '#b0c4de',
  },
  optionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guidanceText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  noticeText: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 30,
    lineHeight: 16,
  },
});

export default RegisterEwalletScreen;
