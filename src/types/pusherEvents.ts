
export interface DispatchUpdateEvent {
    dispatch: {
      id: number;
      actual_dispatch_time: string | null;
      scheduled_dispatch_time: string;
      dispatch: Dispatch;
    };
  }
  
  export interface DispatchFinalizedEvent {
    dispatch: {
      id: number;
      actual_dispatch_time: string | null;
    };
  }
  // src/types/pusherEvents.ts

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
    tricycle: {
      id: number;
      driver_id: number;
      tricycle_number: string;
      created_at: string;
      updated_at: string;
    };
  }
  export interface DispatchEvent {
    dispatch: {
      tricycle_number: string;
      time_left: number;
    };
  }
  
