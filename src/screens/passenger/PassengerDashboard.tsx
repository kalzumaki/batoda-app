import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Button, FlatList} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {logout} from '../../utils/proxy';
import HeaderMain from '../../components/passenger/HeaderCard';
import PassengerLoad from '../../components/passenger/PassengerLoad';
import QueueInfo from '../../components/passenger/QueueInfo';
import {RootStackParamList} from '../../types/passenger-dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const PassengerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      console.log('User Token: ', token);
      if (token) {
        setIsAuthenticated(true);
      } else {
        navigation.replace('Login');
      }
    };

    checkAuth();
  }, [navigation]);
  const handleLogout = async () => {
    setIsLoggingOut(true);

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
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }
  const renderItems = [
    {id: 'header', component: <HeaderMain />},
    {id: 'load', component: <PassengerLoad />},
    {id: 'queue', component: <QueueInfo />},
  ];

  const renderItem = ({
    item,
  }: {
    item: {id: string; component: React.ReactNode};
  }) => <View key={item.id}>{item.component}</View>;

  return (
    <FlatList
      data={renderItems}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListFooterComponent={
        <Button
          title="Logout"
          onPress={handleLogout}
          color="#FF6F61"
          disabled={isLoggingOut}
        />
      }
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
