import io from 'socket.io-client';

const socket = io('http://192.168.101.13:4000', {
  withCredentials: false,
  extraHeaders: {
    'my-custom-header': 'abcd',
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Connected to backend:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('reconnect', (attempt) => {
  console.log('Reconnected to backend on attempt:', attempt);
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

export default socket;