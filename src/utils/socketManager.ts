// src/utils/socketManager.ts
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@env';
import { Socket } from 'socket.io-client';

export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
});

// Debugging (optional)
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});
