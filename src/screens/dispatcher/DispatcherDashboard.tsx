import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get, post} from '../../utils/proxy';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/passenger-dashboard';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import Header from '../../components/dispatcher/Header';
import DispatchCard from '../../components/dispatcher/Dispatch';
import ShowApprovedDispatches from '../../components/dispatcher/ShowApprovedDispatches';
import BottomNav from '../../components/dispatcher/BottomNav';
import ShowIncomeCard from '../../components/ShowIncomeCard';
import ErrorAlertModal from '../../components/ErrorAlertModal';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const DispatcherDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');
  
  const checkAuth = async () => {
    setLoading(true);

    const token = await AsyncStorage.getItem('userToken');
    console.log('User Token: ', token);

    if (!token) {
      navigation.replace('Login');
      setLoading(false);
      return;
    }

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
          'Your Account was Blocked or Session Expired. Please contact management.',
        );
        setShowErrorModal(true);
        return;
      }

      setIsAuthenticated(true);
      await checkEwallet();
    } catch (error) {
      console.error('❌ Error during authentication:', error);
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [navigation]);

  const checkEwallet = async () => {
    try {
      console.log('Checking e-wallet...');
      const response = await get(API_ENDPOINTS.SHOW_EWALLET);
      console.log('E-Wallet API Response:', response);
      if (response.status && response.data) {
        console.log('✅ E-Wallet exists:', response.data);
      } else {
        console.log('❌ No E-Wallet found. Redirecting to Register...');
        navigation.replace('RegisterEwallet');
      }
    } catch (error: any) {
      console.error('❌ Error checking e-wallet:', error);

      if (error.response?.status === 404) {
        console.log('❌ No E-Wallet found (404). Redirecting...');
        navigation.replace('RegisterEwallet');
      } else {
        console.log('🚨 Unexpected error, assuming no e-wallet exists...');
        navigation.replace('RegisterEwallet');
      }
    }
  };
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await checkAuth();
    setRefreshTrigger(prev => prev + 1);
    setLoading(false);
    setRefreshing(false);
  }, []);

  const renderItems = [
    {id: 'header', component: <Header refreshTrigger={refreshTrigger} />},
    {
      id: 'income',
      component: <ShowIncomeCard refreshTrigger={refreshTrigger} />,
    },
    {
      id: 'dispatches',
      component: <DispatchCard refreshTrigger={refreshTrigger} />,
    },
    {
      id: 'approved-dispatches',
      component: <ShowApprovedDispatches refreshTrigger={refreshTrigger} />,
    },
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
    justifyContent: 'center',
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

export default DispatcherDashboard;
