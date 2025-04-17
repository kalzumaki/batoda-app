import {Receipt} from './transaction';

export interface Transaction {
  id: number;
  type: 'transaction';
  from_user: string;
  to_user: string;
  dispatch_id: number;
  ticket_id: number;
  amount: string;
  reference_no: string;
  tricycle_number: string;
  receipt: Receipt;
  date: string;
  time: string;
  created_at: string;
}

export interface TravelHistory {
  id: number;
  type: string;
  ticket_number: string;
  number_of_seats_avail: string;
  reference_no: string;
  status: string;
  tricycle_id: number;
  tricycle_number: string;
  dispatch_id: number;
  date: string;
  time: string;
  created_at: string;
}

export interface TravelData {
  status: boolean;
  travel_history: TravelHistory[];
  transactions: Transaction[];
}

export interface DriverTravelHistoryResponse {
  status: boolean;
  message: string;
  data: {
    dispatch_id: number;
    status: string;
    scheduled_dispatch_time: {
      date: string;
      time: string;
    } | null;
    actual_dispatch_time: {
      date: string;
      time: string;
    } | null;
    passenger_count: number;
    qr_code: string | null;
    dispatcher: {
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
      passenger_id: number;
      passenger: string;
      qr_code: string;
      expire_at: string;
      seat_positions: string[];
    }[];
  }[];
}
