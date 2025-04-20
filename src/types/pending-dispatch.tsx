export interface PendingDispatch {
  id: number;
  driver: {
    fname: string;
    lname: string;
    profile: string | null;
  };
  tricycle: {
    tricycle_number: string;
  };
}
