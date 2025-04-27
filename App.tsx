import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

// Screens
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import PassengerDashboard from './src/screens/passenger/PassengerDashboard';
import TicketScreen from './src/screens/passenger/TicketScreen';
import DriverDashboard from './src/screens/driver/DriverDashboard';
import DispatcherDashboard from './src/screens/dispatcher/DispatcherDashboard';
import ReserveRideScreen from './src/screens/passenger/ReserveRideScreen';
import ScanQRScreen from './src/screens/passenger/ScanQR';
import UserDetailsScreen from './src/screens/passenger/UserDetailsScreen';
import TravelHistoryScreen from './src/screens/passenger/TravelHistoryScreen';
import TravelHistoryDetailScreen from './src/screens/passenger/TravelHistoryDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import RegisterEwalletScreen from './src/screens/RegisterEwalletScreen';
import EmailVerification from './src/screens/EmailVerification';
import OTPVerification from './src/screens/OTPVerification';
import ChangePassEmailVer from './src/screens/ChangePassEmailVer';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import AddTricycleNumberScreen from './src/screens/driver/AddTricycleNumberScreen';
import EditTricycleNumberScreen from './src/screens/driver/EditTricycleNumberScreen';
import ScanQRForPassengers from './src/screens/driver/ScanQRForPassengers';
import TravelHistoryForDrivers from './src/screens/driver/TravelHistoryForDrivers';
import UploadValidIdScreen from './src/screens/UploadValidId';
import TravelHistoryForDispatchers from './src/screens/dispatcher/TravelHistoryForDispatchers';
import ScanQRForDrivers from './src/screens/dispatcher/ScanQRForDrivers';
// Contexts
import {TimerProvider} from './src/contexts/TimerContext';

import {RootStackParamList} from './src/types/passenger-dashboard';

//socket
// import useSocket from './src/utils/socketManager';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
//   useSocket();
  return (
    <TimerProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="PassengerDashboard"
            component={PassengerDashboard}
          />
          <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
          <Stack.Screen
            name="DispatcherDashboard"
            component={DispatcherDashboard}
          />
          <Stack.Screen name="TicketScreen" component={TicketScreen} />
          {/* floating nav */}
          <Stack.Screen name="ReserveRide" component={ReserveRideScreen} />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
          <Stack.Screen
            name="UserDetailsScreen"
            component={UserDetailsScreen}
          />
          <Stack.Screen name="TravelHistory" component={TravelHistoryScreen} />
          <Stack.Screen
            name="TravelHistoryDetail"
            component={TravelHistoryDetailScreen}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerification}
          />
          <Stack.Screen name="OTPVerification" component={OTPVerification} />
          <Stack.Screen
            name="ChangePassEmailVer"
            component={ChangePassEmailVer}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen
            name="AddTricycleNumber"
            component={AddTricycleNumberScreen}
          />
          <Stack.Screen
            name="EditTricycleNumber"
            component={EditTricycleNumberScreen}
          />
          <Stack.Screen
            name="TravelHistoryForDrivers"
            component={TravelHistoryForDrivers}
          />
          <Stack.Screen
            name="ScanQRForPassengers"
            component={ScanQRForPassengers}
          />
          <Stack.Screen
            name="RegisterEwallet"
            component={RegisterEwalletScreen}
          />
          <Stack.Screen name="UploadValidId" component={UploadValidIdScreen} />
          <Stack.Screen name="ScanQRForDrivers" component={ScanQRForDrivers} />
          <Stack.Screen
            name="TravelHistoryForDispatchers"
            component={TravelHistoryForDispatchers}
          />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </TimerProvider>
  );
};

export default App;
