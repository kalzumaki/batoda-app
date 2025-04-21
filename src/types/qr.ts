export interface PassengerQRResponse {
  status: boolean;
  message: string;
  data: Array<{
    dispatch_id: number;
    qr_code: string;
    driver: {full_name: string};
    dispatcher: {full_name: string};
    passengers: Array<{
      user_id: number;
      full_name: string;
      profile_picture: string | null
      qr_code: string;
      expire_at: string;
      seat_positions: string[];
    }>;
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
