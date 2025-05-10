export interface Receipt {
  date: string;
  distpatcher: string;
  driver: string;
  passenger: string;
  seats_reserved: string | string[]; 
  total_cost: number;
  payment_method: string;
}

export interface Transaction {
  transaction_id: number;
  ticket_id: number;
  reference_no: string;
  dispatch_id: number;
  passenger: string;
  batoda_bank_id?: string;
  driver: string;
  amount: string;
  receipt: Receipt;
  created_at: string;
}
