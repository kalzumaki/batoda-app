import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderMain from '../../components/passenger/HeaderCard';
import PassengerLoad from '../../components/passenger/PassengerLoad';
import QueueInfo from '../../components/passenger/QueueInfo';
import Ticket from '../../components/passenger/Ticket';
import { RootStackParamList } from '../../types/passenger-dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingNavigation from '../../components/passenger/FloatingNav';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const PassengerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('User Token: ', token);
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkAuth(); // Recheck authentication on refresh
    setRefreshing(false);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const renderItems = [
    { id: 'header', component: <HeaderMain /> },
    { id: 'load', component: <PassengerLoad /> },
    { id: 'ticket', component: <Ticket /> },
    { id: 'queue', component: <QueueInfo /> },
    { id: 'floatnav', component: <FloatingNavigation /> },
  ];

  const renderItem = ({
    item,
  }: {
    item: { id: string; component: React.ReactNode };
  }) => <View key={item.id}>{item.component}</View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={renderItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PassengerDashboard;
