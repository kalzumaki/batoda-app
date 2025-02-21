import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HeaderMain from '../../components/passenger/HeaderCard';
import PassengerLoad from '../../components/passenger/PassengerLoad';
import QueueInfo from '../../components/passenger/QueueInfo';
import Ticket from '../../components/passenger/Ticket';
import {RootStackParamList} from '../../types/passenger-dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingNavigation from '../../components/passenger/FloatingNav';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const PassengerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Force re-fetch
  const [loading, setLoading] = useState<boolean>(true); // Skeleton loading state

  const checkAuth = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    console.log('User Token: ', token);
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigation.replace('Login');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true); // Show skeleton on refresh
    await checkAuth(); // Ensure user authentication is refreshed
    setRefreshTrigger(prev => prev + 1); // Force child components to re-fetch
    setLoading(false);
    setRefreshing(false);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const renderItems = [
    {id: 'header', component: <HeaderMain refreshTrigger={refreshTrigger} />},
    {id: 'load', component: <PassengerLoad refreshTrigger={refreshTrigger} />},
    {id: 'ticket', component: <Ticket refreshTrigger={refreshTrigger} />},
    {id: 'queue', component: <QueueInfo refreshTrigger={refreshTrigger} />},
    {
      id: 'floatnav',
      component: <FloatingNavigation refreshTrigger={refreshTrigger} />,
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: {id: string; component: React.ReactNode};
  }) => <View key={item.id}>{item.component}</View>;

  return (
    <View style={styles.container}>
      {loading ? (
        // Show skeleton loader when loading
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
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
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PassengerDashboard;
