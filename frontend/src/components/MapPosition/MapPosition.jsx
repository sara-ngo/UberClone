import React, {
  useRef,
  useEffect,
  useState
} from 'react';
import {
  socket
} from './Socket'
import MapPositionEmitter from './emitter';

function MapPosition() {
  useEffect(() => {
    MapPositionEmitter.on("send", (data) => {
      data.senderId = socket.id;
      console.log("Send position data to server:");
      console.log(data);
      socket.emit('send', data);
    });

    socket.emit('request_target')

    socket.on('receive', (data) => {
      MapPositionEmitter.emit("data", data);
    });
  }, []);
}

export default MapPosition;
