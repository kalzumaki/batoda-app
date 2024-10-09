import React, { useEffect, useState } from 'react'; // Added useEffect
import { View, StyleSheet, Button, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout } from '../../utils/proxy';
import HeaderMain from '../../components/passenger/HeaderCard';
import PassengerLoad from '../../components/passenger/PassengerLoad';
import QueueInfo from '../../components/passenger/QueueInfo';
import OptimisticFeedback from '../../components/Loading'; // Import OptimisticFeedback


type RootStackParamList = {
  Login: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const PassengerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogout = async () => {
    console.log('Logout process started');
    setIsLoggingOut(true); // Start optimistic feedback

    try {
      await logout();
      console.log('Logout successful');

      Toast.show({
        type: 'success',
        text1: 'Logout Successful',
      });

      navigation.replace('Login');
      console.log('Navigating to Login screen');
    } catch (error) {
      console.log('Logout failed: ', error);

      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsLoggingOut(false); // End optimistic feedback
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <HeaderMain />
        <PassengerLoad />
        <QueueInfo />
        <Button title="Logout" onPress={handleLogout} color="#FF6F61" disabled={isLoggingOut} />
        
        {/* Display optimistic feedback when logging out */}
        {isLoggingOut && <OptimisticFeedback action="logout" />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#c6d9d7',
  },
});

export default PassengerDashboard;
