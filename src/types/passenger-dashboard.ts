import {TravelHistory} from './travel-history';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PassengerDashboard: undefined;
  DriverDashboard: undefined;
  DispatcherDashboard: undefined;
  TicketScreen: undefined;
  ScanQR: undefined;
  TravelHistory: undefined;
  UserDetailsScreen: {user: UserQRCodeData};
  ReserveRide: {dispatchId: number; tricycleNumber: string};
  TravelHistoryDetail: {item: TravelHistory};
  TravelHistoryScreen: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: {field: string; value: string};
  RegisterEwallet: undefined;
  EmailVerification: {email: string};
  OTPVerification: {email: string};
  ChangePassEmailVer: {email: string};
  ChangePassword: {email: string};
  AddTricycleNumber: undefined;
  EditTricycleNumber: undefined;
  ScanQRForPassengers: undefined;
  TravelHistoryForDrivers: undefined;
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
  profile?: string;
}

export interface RefreshTriggerProp {
  refreshTrigger: number;
}
