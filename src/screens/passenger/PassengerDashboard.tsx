import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, FlatList } from 'react-native';
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

  // Array to hold the main components
  const renderItems = [
    { id: 'header', component: <HeaderMain /> },
    { id: 'load', component: <PassengerLoad /> },
    { id: 'queue', component: <QueueInfo /> },
  ];

  const renderItem = ({ item }: { item: { id: string; component: React.ReactNode } }) => (
    <View key={item.id}>
      {item.component}
    </View>
  );

  return (
    <FlatList
      data={renderItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListFooterComponent={
        <Button title="Logout" onPress={handleLogout} color="#FF6F61" disabled={isLoggingOut} />
      }
      // Disable scrolling if needed
      scrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
 
});

export default PassengerDashboard;
