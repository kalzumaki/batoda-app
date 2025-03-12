import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track loading state for logout

  const toggleDropdown = () => setVisible(!visible);

  const handleLogout = async () => {
    setIsLoggingOut(true); // Start loading

    try {
      await logout();
      await AsyncStorage.removeItem('userToken');
      console.log('Logging out...');
      Toast.show({
        type: 'success',
        text1: 'Logout Successful',
      });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsLoggingOut(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon that triggers dropdown */}
      <TouchableOpacity onPress={toggleDropdown} style={styles.iconContainer}>
        <Image source={require('../assets/4.png')} style={styles.drawerIcon} />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      {visible && (
        <View style={styles.dropdown}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => console.log('Profile')}>
            <Text style={styles.itemText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => console.log('Settings')}>
            <Text style={styles.itemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={handleLogout} // Trigger logout on press
            disabled={isLoggingOut} // Disable logout button while loading
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#FF6F61" /> // Show loading indicator
            ) : (
              <Text style={[styles.itemText, styles.logoutText]}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 20,
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
