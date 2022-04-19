import {socket} from './Socket'
import TripService from './emitter';

function TripServiceInit() {
  TripService.on("positionUpdate", (data) => {
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

  // ride begins
  socket.on("tripBeginRider", (data) => {
    TripService.emit('tripBeginRider');
  });

  socket.on("tripBeginDriver", (data) => {
    TripService.emit('tripBeginDriver');
  });
}

export default TripServiceInit;
