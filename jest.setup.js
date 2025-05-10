import { Pusher } from '@pusher/pusher-websocket-react-native';

// Clear all mocked functions between each test
beforeEach(() => {
  const pusherInstance = Pusher.getInstance();
  pusherInstance.connect.mockClear();
  pusherInstance.disconnect.mockClear();
  pusherInstance.subscribe.mockClear();
  pusherInstance.unsubscribe.mockClear();
  pusherInstance.bind.mockClear();
  pusherInstance.unbind.mockClear();
});
