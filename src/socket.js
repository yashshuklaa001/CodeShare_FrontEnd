import io from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnection: true,
    timeout: 20000,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    transports: ['websocket'],
  };

 
  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

  // Ensure backendUrl is defined
  if (!backendUrl) {
    console.log("Backend URL is not defined. Please check your environment variables.");
  }

  return io(backendUrl, options);
};
