export interface Transaction {
  id: number;
  type: string;
  from_user: string;
  to_user: string;
  dispatch_id: number;
  ticket_id: number;
  amount: string;
  reference_no: string;
  tricycle_number: string;
  receipt: {
    date: string;
    driver: string;
    passenger: string;
    total_cost: number;
    seats_reserved: string[];
  };
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
