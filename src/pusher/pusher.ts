import { PUSHER_API_KEY, PUSHER_CLUSTER } from '@env';
import {Pusher, PusherEvent} from '@pusher/pusher-websocket-react-native';
export const pusher = Pusher.getInstance();

const eventListeners: Record<string, Array<(event: any) => void>> = {};

export async function initPusher(): Promise<void> {
  try {
    console.log('Initializing Pusher...');
    await pusher.init({
      apiKey: PUSHER_API_KEY,
      cluster: PUSHER_CLUSTER,
      onEvent: (event: PusherEvent) => {
        console.log(`Event received: ${JSON.stringify(event)}`);
        const listeners = eventListeners[event.channelName] || [];
        listeners.forEach(listener => listener(event));
      },
    });
    console.log('Pusher initialized');
    await pusher.connect();
  } catch (error) {
    console.error('Error initializing Pusher:', error);
  }
}

export async function subscribeToChannel(
  channelName: string,
  onEvent: (event: PusherEvent) => void,
): Promise<void> {
  try {
    if (!eventListeners[channelName]) {
      eventListeners[channelName] = [];
      await pusher.subscribe({channelName});
      console.log(`Subscribed to channel: ${channelName}`);
    }

    eventListeners[channelName].push(onEvent);
    console.log(`Listener added to channel: ${channelName}`);
  } catch (error) {
    console.error(`Error subscribing to channel ${channelName}:`, error);
  }
}

export function unsubscribeFromChannel(
  channelName: string,
  onEvent: (event: PusherEvent) => void,
): void {
  if (eventListeners[channelName]) {
    eventListeners[channelName] = eventListeners[channelName].filter(
      listener => listener !== onEvent,
    );

    if (eventListeners[channelName].length === 0) {
      delete eventListeners[channelName];
      pusher.unsubscribe({channelName});
      console.log(`Unsubscribed from channel: ${channelName}`);
    }
  }
}
