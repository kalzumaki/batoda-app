// PusherProvider.tsx
import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {pusher, initPusher, subscribeToChannel, unsubscribeFromChannel} from './pusher';
import {PusherEvent} from '@pusher/pusher-websocket-react-native';

interface PusherContextType {
  subscribeToChannel: (
    channelName: string,
    onEvent: (event: PusherEvent) => void,
  ) => Promise<void>;
  unsubscribeFromChannel: (
    channelName: string,
    onEvent: (event: PusherEvent) => void,
  ) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export const usePusher = (): PusherContextType => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

interface PusherProviderProps {
  children: ReactNode;
}

export const PusherProvider: React.FC<PusherProviderProps> = ({children}) => {
  useEffect(() => {
    const setupPusher = async () => {
      await initPusher();
    };

    setupPusher();

    return () => {
      console.log('Cleaning up Pusher instance...');
      pusher.disconnect();
    };
  }, []);

  const contextValue = {
    subscribeToChannel,
    unsubscribeFromChannel,
  };

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
};
