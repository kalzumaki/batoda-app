import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get, post} from '../../utils/proxy';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import Header from '../../components/driver/Header';
import ShowDispatches from '../../components/driver/ShowDispatches';
import ShowInQueue from '../../components/driver/ShowInQueue';
import BottomNav from '../../components/driver/BottomNav';
import ShowIncomeCard from '../../components/ShowIncomeCard';
import ErrorAlertModal from '../../components/ErrorAlertModal';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const DriverDashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProps>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');

  const checkAuth = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    console.log('User Token: ', token);

    if (!token) {
      navigation.replace('Login');
      return;
    }

    // Token exists
    setIsAuthenticated(true);

    try {
      const response = await post(API_ENDPOINTS.VALIDATE_TOKEN, {}, true);
      console.log('response: ', response);
      if (
        response?.message === 'Unauthenticated.' ||
        response?.status === false
      ) {
        console.log('🔒 Unauthenticated or blocked. Redirecting to Login...');
        await AsyncStorage.removeItem('userToken');
        setResponseErrorMessage(
          'Your Account was Blocked. Please contact management.',
        );
        setShowErrorModal(true);
        return;
      }

      const walletValid = await checkEwallet();
      if (!walletValid) return;

      const tricycleValid = await checkTricycleNumber();
      if (!tricycleValid) {
        navigation.replace('AddTricycleNumber');
      }
    } catch (error) {
      console.error('❌ Error during auth checks:', error);
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const checkEwallet = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking e-wallet...');
      const response = await get(API_ENDPOINTS.SHOW_EWALLET);
      console.log('💳 E-Wallet API Response:', response);

      if (response.status && response.data) {
        console.log('✅ E-Wallet exists.');
        return true;
      } else {
        console.log('❌ No E-Wallet found. Redirecting...');
        navigation.replace('RegisterEwallet');
        return false;
      }
    } catch (error) {
      console.log('❌ E-wallet check failed:', error);
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
      return false;
    }
  };

  const checkTricycleNumber = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking tricycle number...');
      const response = await get(API_ENDPOINTS.FETCH_TRICYCLE_NUMBER);
      console.log('🚐 Tricycle Number API Response:', response);

      if (!response?.status || !response?.tricycle_number) {
        console.log('❌ No Tricycle Number found.');
        return false;
      }

      return true;
    } catch (error) {
      console.log('❌ Error checking tricycle number:', error);
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
    {
      id: 'income',
      component: <ShowIncomeCard refreshTrigger={refreshTrigger} />,
    },
    // add here the bottom nav
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
        <>
          <FlatList
            data={renderItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
          {/* Fixed Bottom Navigation */}
          <BottomNav />
        </>
      ) : null}
      <ErrorAlertModal
        visible={showErrorModal}
        title="Account Blocked"
        message={responseErrorMessage}
        onDismiss={() => navigation.replace('Login')}
      />
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
