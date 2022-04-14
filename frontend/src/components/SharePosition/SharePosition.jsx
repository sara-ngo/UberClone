import {
  socket
} from './Socket'
import SharePositionEmitter from './emitter';

function SharePosition() {
  SharePositionEmitter.on("send", (data) => {
    data.senderId = socket.id;
    console.log("Send position data to server:");
    console.log(data);
    socket.emit('send', data);
  });

  socket.emit('request_target')

  socket.on('receive', (data) => {
    SharePositionEmitter.emit("data", data);
  })
}

export default SharePosition;
