import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';
const socket = io(BACKEND_URL);

export default socket;