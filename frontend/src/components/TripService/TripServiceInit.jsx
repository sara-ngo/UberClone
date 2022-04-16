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
    TripService.on("positionUpdate", (data) => {
      //data.senderId = socket.id;
      console.log("Send position data to server:");
      console.log(data);
      socket.emit('positionUpdate', data);
    });

    socket.on('positionData', (data) => {
      TripService.emit("positionData", data);
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
