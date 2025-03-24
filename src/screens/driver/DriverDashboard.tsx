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
      if (token) {
        await checkEwallet();
        setIsAuthenticated(true);
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('❌ Error during authentication:', error);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const checkEwallet = async () => {
    try {
      console.log('Checking e-wallet...');
      const response = await get(API_ENDPOINTS.SHOW_EWALLET);
      console.log('E-Wallet API Response:', response);

      if (!response.status || !response.data) {
        console.log('❌ No E-Wallet found. Redirecting to Register...');
        navigation.replace('RegisterEwallet');
      }
    } catch (error: any) {
      console.error('❌ Error checking e-wallet:', error);
      navigation.replace('RegisterEwallet');
    }
  };

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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
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
