import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/passenger-dashboard';
import { logout } from '../utils/proxy';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const CustomDropdown: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [visible, setVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState(0);
  const [tricycleNumber, setTricycleNumber] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await AsyncStorage.getItem('userType');
      const number = await AsyncStorage.getItem('tricycleNumber');
      setUserRole(role ? parseInt(role) : 0);
      setTricycleNumber(number || '');
    };
    fetchUserRole();
  }, []);

  const toggleDropdown = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      await AsyncStorage.removeItem('userToken');
      Toast.show({ type: 'success', text1: 'Logout Successful' });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Trigger Icon */}
      <TouchableOpacity onPress={toggleDropdown} style={styles.iconContainer}>
        <Image source={require('../assets/4.png')} style={styles.drawerIcon} />
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={closeDropdown}>
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dropdown,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                  },
                ]}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    closeDropdown();
                    navigation.navigate('Profile');
                  }}>
                  <Text style={styles.itemText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    closeDropdown();
                    navigation.navigate('Settings');
                  }}>
                  <Text style={styles.itemText}>Settings</Text>
                </TouchableOpacity>
                {userRole === 6 && (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      closeDropdown();
                      navigation.navigate('EditTricycleNumber');
                    }}>
                    <Text style={styles.itemText}>Edit Tricycle No.</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}
                  disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#FF6F61" />
                  ) : (
                    <Text style={[styles.itemText, styles.logoutText]}>
                      Logout
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginLeft: 'auto',
  },
  drawerIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
    width: 180,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
    borderColor: '#ddd',
    color: 'black',
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 14,
    color: 'black',
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default CustomDropdown;
