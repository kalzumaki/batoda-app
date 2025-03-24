import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HeaderMain from '../../components/passenger/HeaderCard';
import PassengerLoad from '../../components/passenger/PassengerLoad';
import QueueInfo from '../../components/passenger/QueueInfo';
import Ticket from '../../components/passenger/Ticket';
import {RootStackParamList} from '../../types/passenger-dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingNavigation from '../../components/passenger/FloatingNav';
import {fetchToken, get, post, postWithoutPayload} from '../../utils/proxy';
import {API_ENDPOINTS} from '../../api/api-endpoints';
import {useFocusEffect} from '@react-navigation/native';
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const PassengerDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    console.log('User Token: ', token);
    if (token) {
      setIsAuthenticated(true);
      await checkEwallet();
    } else {
      navigation.replace('Login');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [navigation]);

  //   useFocusEffect(
  //     useCallback(() => {
  //       checkAuth();
  //     }, [navigation])
  //   );
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

  //   const showEwalletAlert = () => {
  //     console.log('🔔 Showing E-Wallet Alert...');

  //     Alert.alert(
  //       'No E-Wallet Registered',
  //       'You need to register an e-wallet before proceeding.',
  //       [
  //         {
  //           text: 'Register',
  //           onPress: async () => {
  //             console.log('✅ User chose to register E-Wallet.');
  //             await registerEwallet();
  //           },
  //         },
  //       ],
  //     );
  //   };

  //   const registerEwallet = async () => {
  //     try {
  //       console.log('🚀 Registering E-Wallet...');

  //       const response = await post(
  //         API_ENDPOINTS.REGISTER_EWALLET,
  //         {
  //           bank_name: 'GCash',
  //         },
  //         true,
  //       );

  //       if (response.status) {
  //         Alert.alert(
  //           'Success',
  //           'Your e-wallet has been registered successfully!',
  //         );
  //       } else {
  //         Alert.alert(
  //           'Error',
  //           response.message || 'Failed to register e-wallet.',
  //         );
  //       }
  //     } catch (error) {
  //       console.error('❌ Error registering e-wallet:', error);
  //       Alert.alert('Error', 'An unexpected error occurred.');
  //     }
  //   };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await checkAuth();
    setRefreshTrigger(prev => prev + 1);
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <>
          {/* Scrollable FlatList */}
          <FlatList
            data={renderItems.filter(item => item.id !== 'floatnav')} // Exclude FloatingNav from FlatList
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            scrollEnabled={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />

          {/* Fixed Floating Navigation */}
          <View style={styles.floatingNavWrapper} pointerEvents="box-none">
            <FloatingNavigation refreshTrigger={refreshTrigger} />
          </View>
        </>
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
    paddingBottom: 80,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  dropdown: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    color: 'black',
  },
  dropdownText: {
    fontSize: 16,
  },
  option: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none', // Ensures touch events pass through
  },
});

export default PassengerDashboard;
