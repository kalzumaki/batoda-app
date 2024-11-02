import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { Dispatch, DispatchResponse } from '../types/approved-dispatch';
export const pusher = Pusher.getInstance();

export async function initPusher(): Promise<void> {
    try {
      console.log('Initializing Pusher...');
      await pusher.init({
        apiKey: "e387ee412efd2031b93c",
        cluster: "ap1",
        onEvent: (event: PusherEvent) => {
          console.log(`Event received: ${JSON.stringify(event)}`);
        },
      });
      console.log('Pusher initialized');
      await pusher.connect();
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
  }

export async function subscribeToChannel(channelName: string, onEvent: (event: any) => void): Promise<void> {
    try {
        // Subscribe to the specified channel
        await pusher.subscribe({
            channelName,
            onEvent: (event: any) => {
                console.log(`Received event on ${channelName}:`, JSON.stringify(event));
                // Call the provided event handler function with the received event
                onEvent(event);
            },
        });
        console.log(`Successfully subscribed to channel: ${channelName}`);
    } catch (error) {
        console.error(`Error subscribing to channel ${channelName}:`, error);
    }
}
