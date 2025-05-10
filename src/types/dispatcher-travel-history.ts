export interface DispatcherTravelHistory {
  status: boolean;
  message: string;
  data: {
    dispatch_id: number;
    status: 'approved' | 'rejected' | string;
    scheduled_dispatch_time: {
      date: string;
      time: string;
    } | null;
    actual_dispatch_time: {
      date: string;
      time: string;
    } | null;
    passenger_count: number;
    qr_code: string;
    driver: {
      full_name: string;
      email: string;
    };
    created_at: {
      raw: string;
      date: string;
      time: string;
    };
    reservations: {
      reservation_id: number;
      passenger: string;
      seat_positions: string[];
    }[];
  }[];
}
