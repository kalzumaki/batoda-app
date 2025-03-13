import { TravelHistory } from "./travel-history";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PassengerDashboard: undefined;
  DriverDashboard: undefined;
  DispatcherDashboard: undefined;
  TicketScreen: undefined;
  ScanQR: undefined;
  TravelHistory: undefined;
  UserDetailsScreen: {user: UserQRCodeData}; // Ensure this is correctly defined
  ReserveRide: {dispatchId: number; tricycleNumber: string};
  TravelHistoryDetail: { item: TravelHistory };
  TravelHistoryScreen: undefined;
};

export interface UserQRCodeData {
  id: number;
  name: string;
  email: string;
  age: number;
  address: string;
  mobile: string;
  gender: string;
  role: string;
  tricycle: string;
  profile?: string; // Optional profile image URL
}

export interface RefreshTriggerProp {
  refreshTrigger: number;
}
