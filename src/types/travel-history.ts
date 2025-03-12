// Interface for a single cancelled ticket
export interface CancelledTicket {
  ticket_id: number;
  ticket_number: string;
  number_of_seats_avail: string;
  reference_no: string;
  status: string;
  tricycle_id: number;
  tricycle_number: string;
  dispatch_id: number;
  date: string;
  time: string;
}

// Interface for cancelled tickets response
export interface CancelledTicketsResponse {
  status: boolean;
  cancelled_tickets: CancelledTicket[];
}

// Interface for a single transaction
export interface Transaction {
  transaction_id: number;
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
}

// Interface for transactions response
export interface TransactionsResponse {
  status: boolean;
  transactions: Transaction[];
}

export interface Receipt {
  date: string;
  driver: string;
  passenger: string;
  total_cost: number;
  seats_reserved: string[];
}
