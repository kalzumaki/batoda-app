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
      qr_code: string;
      expire_at: string;
      seat_positions: string[];
    }>;
  }>;
}
