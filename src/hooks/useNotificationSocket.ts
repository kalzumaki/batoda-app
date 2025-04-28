// src/hooks/useNotificationSocket.ts
import useSocketListener from './useSocketListener';
import { useNotification } from '../contexts/NotificationContext';
import { playNotificationSound } from '../utils/soundManager';

const useNotificationSocket = () => {
  const { addNotification } = useNotification();

  useSocketListener('notification', (data) => {
    console.log('🔔 New Notification:', data);

    addNotification({
      id: data.id,        // or generate random ID if needed
      title: data.title,
      message: data.message,
    });

    playNotificationSound();
  });
};

export default useNotificationSocket;
