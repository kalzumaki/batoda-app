export interface Ticket {
    id: string;
    status: string;
    ticket_number: string;
    dispatch_id: string;
    tricycle_number: string;
    number_of_seats_avail: number;
    reference_no: string;
    created_at: string;
    total_price?: number; // This field will be added dynamically
  }

