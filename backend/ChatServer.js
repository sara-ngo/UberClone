let webSocketServer = {};

function ChatServer(webSocketServer_) {
  webSocketServer = webSocketServer_;

  webSocketServer.on('connection', (socket) => {
    // Reject all connections that are not for the chat service
    if(!socket.handshake.query.service){
      return;
    }
    if(socket.handshake.query.service != "chat"){
      return;
    }
    console.log("[ChatServer] User Connected:", socket.id);

    socket.on('request_target', () => {
      webSocketServer.allSockets().then((result) => {
        for (let item of result) {
          if (item != socket.id) {
            // console.log('targets:', socket.id, item)
            socket.emit('receive_target', item)
            socket.to(item).emit('receive_target', socket.id)
          }
        }
      })
    })

    socket.on('send_pm', (data) => {
      // console.log(data)
      socket.to(data.target).emit('receive_pm', data)
    })
  })
}

export default ChatServer;
