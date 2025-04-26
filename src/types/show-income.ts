export interface Transaction {
    id: number;
    from_user_id: number;
    to_user_id: number;
    dispatch_id: number;
    ticket_id: number;
    batoda_bank_id: number | null;
    amount: string;  // Amount as string to match the provided data format
    reference_no: string;
    created_at: string;
    updated_at: string;
    display_date: string;
  }

  export interface MonthlyIncome {
    month: string;
    total_income: string;  // String to match the format of "240.00" in the response
  }

  export interface IncomeGroup {
    date: string;
    total_income: number;  // Total income for the specific date (e.g., Today, Yesterday, etc.)
    monthly_income: MonthlyIncome[];  // Monthly income for the month associated with the income group
    transactions: Transaction[];
  }
