import { v4 as uuidv4 } from 'uuid';
import http from 'http'
import {
  Server
} from 'socket.io'

const messages = new Set();
const users = new Map();

const defaultUser = {
  id: 'anon',
  name: 'Anonymous',
};

const messageExpirationTimeMS = 5*60 * 1000;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('getMessages', () => this.getMessages());
    socket.on('message', (value) => this.handleMessage(value));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendMessage(message) {
    this.io.sockets.emit('message', message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket) || defaultUser,
      value,
      time: Date.now()
    };

    messages.add(message);
    this.sendMessage(message);

    setTimeout(
      () => {
        messages.delete(message);
        this.io.sockets.emit('deleteMessage', message.id);
      },
      messageExpirationTimeMS,
    );
  }

  disconnect() {
    users.delete(this.socket);
  }
}

function ChatServer(app) {
  // socket.io
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  //Whenever someone connects this gets executed
  io.on('connection', function(socket) {
     console.log('A user connected');

     //Whenever someone disconnects this piece of code executed
     socket.on('disconnect', function () {
        console.log('A user disconnected');
     });
  });

  io.on('connection', (socket) => {
    new Connection(io, socket);
  });

  httpServer.listen(4000, function() {
    console.log('Socket server listening at http://localhost:4000')
  })
};

export default ChatServer;
