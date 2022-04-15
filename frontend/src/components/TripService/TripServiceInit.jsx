import React, {
  useRef,
  useEffect,
  useState
} from 'react';
import {
  socket
} from './Socket'
import TripService from './emitter';

function TripServiceInit() {
  useEffect(() => {
    TripService.on("send", (data) => {
      //data.senderId = socket.id;
      console.log("Send position data to server:");
      console.log(data);
      socket.emit('send', data);
    });

    socket.emit('request_target')

    socket.on('receive', (data) => {
      TripService.emit("data", data);
    });

    TripService.on("requestRide", (data) => {
      socket.emit('requestRide');
    });

    socket.on('requestRideProgress', (data) => {
      TripService.emit("requestRideProgress", data);
    });
  }, []);
}

export default TripServiceInit;
