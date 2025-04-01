export interface Tricycle {
  id: number;
  driver_id: number;
  tricycle_number: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  fname: string;
  lname: string;
  email: string;
  mobile_number: string;
  address: string;
  age: number;
  gender: string;
  user_type_id: number;
  is_approved: number;
  created_at: string;
  updated_at: string;
  profile:string;
}

export interface Dispatcher {
  id: number;
  fname: string;
  lname: string;
  email: string;
  mobile_number: string;
  address: string;
  age: number;
  gender: string;
  user_type_id: number;
  is_approved: number;
  created_at: string;
  updated_at: string;
}

export interface Dispatch {
  id: number;
  driver_id: number;
  dispatcher_id: number;
  status: string;
  dispatch_request_time: string;
  dispatcher_response_time: string;
  scheduled_dispatch_time: string;
  is_dispatched: number;
  created_at: string;
  updated_at: string;
  passenger_count: number;
  actual_dispatch_time: string | null;
  driver: Driver;
  dispatcher: Dispatcher;
  tricycle: Tricycle;
}

export interface DispatchResponse {
  status: boolean;
  message: string;
  dispatches: Dispatch[];
}

export interface DispatchRequestResponse {
    status: boolean;
    message: string;
    dispatch?: {
      id: number;
      driver_id: number;
      status: string;
      dispatch_request_time: string;
      created_at: string;
      updated_at: string;
    };
  }
