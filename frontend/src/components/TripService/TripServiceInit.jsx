import {socket} from './Socket'
import TripService from './emitter';

function TripServiceInit() {
  TripService.on("positionUpdate", (data) => {
    data.token = localStorage.getItem("token");
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

  socket.on('requestRideCancel', (data) => {
    TripService.emit("requestRideCancel", data);
  });

  // These events are for the driver to confirm the trip
  socket.on('requestRideConfirm', (data) => {
    TripService.emit("requestRideConfirm", data);
  });

  socket.on('requestRideConfirmProgress', (data) => {
    TripService.emit("requestRideConfirmProgress", data);
  });

  TripService.on("requestRideDone", (data) => {
    socket.emit('requestRideDone');
  });

  // trip: driver to rider
  socket.on("tripDriverToRiderBegin", (data) => {
    TripService.emit('tripDriverToRiderBegin');
  });

  socket.on("tripDriverToRiderProgress", (data) => {
    TripService.emit('tripDriverToRiderProgress');
  });

  socket.on("tripDriverToRiderCancel", (data) => {
    TripService.emit('tripDriverToRiderCancel');
  });

  socket.on("tripDriverToRiderConfirm", (data) => {
    TripService.emit('tripDriverToRiderConfirm');
  });

  socket.on("tripDriverToRiderConfirmProgress", (data) => {
    TripService.emit('tripDriverToRiderConfirmProgress');
  });

  TripService.on("tripDriverToRiderDone", (data) => {
    socket.emit('tripDriverToRiderDone');
  });

  // trip: driver and rider together
  socket.on("tripTogetherBegin", (data) => {
    TripService.emit('tripTogetherBegin');
  });

  socket.on("tripTogetherProgress", (data) => {
    TripService.emit('tripTogetherProgress');
  });

  socket.on("tripTogetherCancel", (data) => {
    TripService.emit('tripTogetherCancel');
  });

  socket.on("tripTogetherConfirm", (data) => {
    TripService.emit('tripTogetherConfirm');
  });

  TripService.on("tripTogetherDone", (data) => {
    socket.emit('tripTogetherDone');
  });
}

export default TripServiceInit;
