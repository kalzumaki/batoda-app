import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../utils/proxy';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import Header from '../../components/driver/Header';
import ShowDispatches from '../../components/driver/ShowDispatches';
import ShowInQueue from '../../components/driver/ShowInQueue';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const DriverDashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProps>();

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      // Run checks in parallel
      const [ewalletResponse, tricycleResponse] = await Promise.all([
        checkEwallet(),
        checkTricycleNumber(),
      ]);

      // Handle navigation only after both checks
      if (!ewalletResponse) {
        navigation.replace('RegisterEwallet');
      } else if (!tricycleResponse) {
        navigation.replace('AddTricycleNumber');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ Error during authentication:', error);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const checkTricycleNumber = async () => {
    try {
      console.log('Checking tricycle number...');
      const response = await get(API_ENDPOINTS.FETCH_TRICYCLE_NUMBER);
      console.log('Tricycle Number API Response:', response);

      if (!response.status || !response.tricycle_number) {
        console.log('❌ No Tricycle Number found.');
        return false;
      }
      return true;
    } catch (error: any) {
      console.log('❌ Error checking tricycle number:', error);
      return false;
    }
  };

  const checkEwallet = async () => {
    try {
      console.log('Checking e-wallet...');
      const response = await get(API_ENDPOINTS.SHOW_EWALLET);
      console.log('E-Wallet API Response:', response);

      if (!response.status || !response.data) {
        console.log('❌ No E-Wallet found.');
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('❌ Error checking e-wallet:', error);
      return false;
    }
  };

  // Run authentication check once the component mounts
  useEffect(() => {
    checkAuth();
  }, [navigation]);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkAuth();
    setRefreshing(false);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const renderItems = [
    {id: 'header', component: <Header refreshTrigger={refreshTrigger} />},
    // {id: 'dispatches', component: <ShowDispatches refreshTrigger={refreshTrigger} />},
    {id: 'queue', component: <ShowInQueue refreshTrigger={refreshTrigger} />},
  ];

  const renderItem = ({
    item,
  }: {
    item: {id: string; component: React.ReactNode};
  }) => <View key={item.id}>{item.component}</View>;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <FlatList
          data={renderItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
});

export default DriverDashboard;
