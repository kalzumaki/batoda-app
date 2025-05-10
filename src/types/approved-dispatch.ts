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
  export interface DispatchResponseByDispatcher {
    status: boolean;
    message: string;
    dispatches: {
      id: number;
      driver_id: number;
      dispatcher_id: number;
      status: string;
      dispatch_request_time: string;
      dispatcher_response_time: string;
      scheduled_dispatch_time: string;
      is_dispatched: boolean | number;
      created_at: string;
      updated_at: string;
      dispatch_option_id: number | null;
      passenger_count: number;
      actual_dispatch_time: string | null;
      qr_code: string | null;
      driver: {
        id: number;
        fname: string;
        lname: string;
        email: string;
        email_verified_at: string;
        mobile_number: string;
        address: string;
        birthday: string;
        age: number;
        gender: string;
        user_type_id: number;
        is_approved: boolean | number;
        password_updated_at: string | null;
        created_at: string;
        updated_at: string;
        qr_code: string | null;
        profile: string | null;
        deleted_at: string | null;
      };
      dispatcher: {
        id: number;
        fname: string;
        lname: string;
        email: string;
        email_verified_at: string;
        mobile_number: string;
        address: string;
        birthday: string;
        age: number;
        gender: string;
        user_type_id: number;
        is_approved: boolean | number;
        password_updated_at: string | null;
        created_at: string;
        updated_at: string;
        qr_code: string | null;
        profile: string | null;
        deleted_at: string | null;
      };
      tricycle: {
        id: number;
        driver_id: number;
        tricycle_number: string;
        created_at: string;
        updated_at: string;
      };
    }[];
  }
