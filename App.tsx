// src/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen'; 
import PassengerDashboard from './src/screens/passenger/PassengerDashboard';
import DriverDashboard from './src/screens/driver/DriverDashboard';
import DispatcherDashboard from './src/screens/dispatcher/DispatcherDashboard';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
       <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Remove header for all screens
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="PassengerDashboard" component={PassengerDashboard} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
        <Stack.Screen name="DispatcherDashboard" component={DispatcherDashboard} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;
