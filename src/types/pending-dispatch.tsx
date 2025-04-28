export interface PendingDispatch {
  id: number;
  created_at: string;
  driver: {
    fname: string;
    lname: string;
    profile: string | null;
  };
  tricycle: {
    tricycle_number: string;
  };
}
