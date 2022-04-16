import React, {useRef, useEffect, useState} from 'react';
import {socket} from './Socket'
import TripService from './emitter';

function TripServiceInit() {
  useEffect(() => {
    TripService.on("positionUpdate", (data) => {
      //data.senderId = socket.id;
      socket.emit('positionUpdate', data);
    });

    socket.on('positionData', (data) => {
      TripService.emit("positionData", data);
    });

    // These events are for the rider to request a trip
    TripService.on("requestRide", (data) => {
      socket.emit('requestRide');
    });

    socket.on('requestRideProgress', (data) => {
      TripService.emit("requestRideProgress", data);
    });

    // These events are for the driver to confirm the trip
    TripService.on("confirmTrip", (data) => {
      socket.emit('confirmTrip');
    });

    socket.on('requestRideDriverConfirm', (data) => {
      TripService.emit("requestRideDriverConfirm", data);
    });

    socket.on('confirmTripProgress', (data) => {
      TripService.emit("confirmTripProgress", data);
    });
  });
}

export default TripServiceInit;
