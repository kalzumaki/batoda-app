export interface IncomeResponse {
    status: boolean;
    message: string;
    history: {
      date: string;
      total_income: number;
      transactions: {
        id: number;
        from_user_id: number;
        to_user_id: number;
        dispatch_id: number;
        ticket_id: number;
        batoda_bank_id: number | null;
        amount: string;
        reference_no: string;
        created_at: string;
        updated_at: string;
        display_date: string;
      }[];
    }[];
    monthly_income: {
      month: string;
      total_income: string;
    }[];
  }
