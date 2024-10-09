import {
  Pusher,
  PusherMember,
  PusherChannel,
  PusherEvent,
} from '@pusher/pusher-websocket-react-native';

const pusher = Pusher.getInstance();

await pusher.init({
  apiKey: 'e387ee412efd2031b93c',
  cluster: 'ap1',
});

await pusher.connect();
await pusher.subscribe({
  channelName: 'my-channel',
  onEvent: (event: PusherEvent) => {
    console.log(`Event received: ${event}`);
  },
});


