import {useEffect} from 'react';
import {socket} from '../utils/socketManager';

const useSocketListener = (
  eventName: string,
  callback: (data: any) => void,
) => {
  useEffect(() => {
    if (!socket) {
      console.error('Socket not initialized yet.');
      return;
    }

    const registerListener = () => {
      console.log(`Registering listener for ${eventName}`);
      socket.on(eventName, callback);
    };

    if (socket.connected) {
      registerListener();
    } else {
      socket.once('connect', () => {
        registerListener();
      });
    }

    return () => {
      console.log(`Removing listener for ${eventName}`);
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};

export default useSocketListener;
