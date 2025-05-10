export interface PassengerQRResponse {
  status: boolean;
  message: string;
  data: Array<{
    dispatch_id: number;
    reservation_id: number;
    qr_code: string;
    user_id: number;
    full_name: string;
    profile_picture: string | null;
    dispatcher_full_name: string;
    is_paid: boolean;
    expire_at: string;
    seat_positions: string[]; // Array of seat positions
  }>;
}

export interface DispatchData {
  dispatch_id: number;
  qr_code: string;
  driver: {
    full_name: string;
    profile: string;
    tricycle_number: string;
  };
  dispatcher: {
    full_name: string;
  };
}

export interface DispatcherQrResponse {
  status: boolean;
  message: string;
  data: DispatchData[];
}
