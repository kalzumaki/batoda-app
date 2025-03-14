// src/screens/dispatcher/DispatcherDashboard.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, logout } from '../../utils/proxy';
import { User } from '../../types/user'; // Import the Dispatcher type
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/passenger-dashboard';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const DispatcherDashboard: React.FC = () => {
  const [dispatcherData, setDispatcherData] = useState<User | null>(null);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const fetchDispatcherData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const data = await get('/dispatchers');
          setDispatcherData(data.data[0]);
        } catch (error) {
          console.error('Error fetching dispatcher data:', error);
        }
      }
    };

    fetchDispatcherData();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Attempting to log out...');

      await logout();

      console.log('Logout successful, removing token from AsyncStorage...');

      Toast.show({
        type: 'success',
        text1: 'Logout Successful',
      });

      console.log('Navigating back to the login screen...');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);

      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Please try again.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispatcher Dashboard</Text>
      {dispatcherData ? (
        <Text style={styles.welcomeText}>
          Welcome, {dispatcherData.fname} {dispatcherData.lname}!
        </Text>
      ) : (
        <Text style={styles.loadingText}>Loading your data...</Text>
      )}

      <Button title="Logout" onPress={handleLogout} color="#FF6F61" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#145A32',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F1F8E9',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#E8F5E9',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#C8E6C9',
  },
});

export default DispatcherDashboard;
