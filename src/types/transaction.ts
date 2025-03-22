export interface Receipt {
    date: string;
    driver: string;
    passenger: string;
    total_cost: number;
    seats_reserved: string[];
  }

  export interface Transaction {
    transaction_id: number;
    ticket_id: number;
    reference_no: string;
    dispatch_id: number;
    passenger: string;
    driver: string;
    amount: string;
    receipt: Receipt;
    created_at: string;
  }

