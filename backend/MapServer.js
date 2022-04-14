import http from 'http'
import {
  Server
} from 'socket.io'

function MapServer(app) {
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    }
  })

  io.on('connection', socket => {
    console.log(`Position User Connected: ${socket.id}`)

    socket.on('request_target', () => {
      io.allSockets().then((result) => {
        for (let item of result) {
          if (item != socket.id) {
            console.log('targets:', socket.id, item)
            socket.emit('receive_target', item)
            socket.to(item).emit('receive_target', socket.id)
          }
        }
      })
    })

    socket.on('send', (data) => {
      console.log(data)
      io.sockets.emit('receive', data)
    })
  })

  httpServer.listen(4001, function() {
    console.log('Position Socket server listening at http://localhost:4001')
  })
}

export default MapServer;
