import {socket} from './Socket'
import TripService from './emitter';

const TripServiceInit = () => {
  TripService.on("positionUpdate", (data) => {
    data.token = localStorage.getItem("token");
    socket.emit('positionUpdate', data);
  });

  socket.on('positionData', (data) => {
    TripService.emit("positionData", data);
  });

  // These events are for the rider to request a trip
  TripService.on("requestRide", (data) => {
    socket.emit('requestRide', data);
  });

  socket.on('requestRideProgress', (data) => {
    TripService.emit("requestRideProgress", data);
  });

  socket.on('requestRideStop', (data) => {
    TripService.emit("requestRideStop", data);
  });

  TripService.on("requestRideCancel", (data) => {
    socket.emit('requestRideCancel', data);
  });

  // These events are for the driver to confirm the trip
  socket.on('requestRideConfirm', (data) => {
    TripService.emit("requestRideConfirm", data);
  });

  socket.on('requestRideConfirmProgress', (data) => {
    TripService.emit("requestRideConfirmProgress", data);
  });

  TripService.on("requestRideDone", (data) => {
    socket.emit('requestRideDone', data);
  });

  // trip: driver to rider
  socket.on("tripDriverToRiderBegin", (data) => {
    TripService.emit('tripDriverToRiderBegin', data);
  });

  socket.on("tripDriverToRiderProgress", (data) => {
    TripService.emit('tripDriverToRiderProgress', data);
  });

  socket.on("tripDriverToRiderStop", (data) => {
    TripService.emit('tripDriverToRiderStop', data);
  });

  socket.on("tripDriverToRiderConfirm", (data) => {
    TripService.emit('tripDriverToRiderConfirm', data);
  });

  socket.on("tripDriverToRiderConfirmProgress", (data) => {
    TripService.emit('tripDriverToRiderConfirmProgress', data);
  });

  TripService.on("tripDriverToRiderCancel", (data) => {
    socket.emit('tripDriverToRiderCancel', data);
  });

  TripService.on("tripDriverToRiderConfirmDone", (data) => {
    socket.emit('tripDriverToRiderConfirmDone', data);
  });

  // trip: driver and rider together
  socket.on("tripTogetherBegin", (data) => {
    TripService.emit('tripTogetherBegin', data);
  });

  socket.on("tripTogetherProgress", (data) => {
    TripService.emit('tripTogetherProgress', data);
  });

  socket.on("tripTogetherStop", (data) => {
    TripService.emit('tripTogetherStop', data);
  });

  socket.on("tripTogetherConfirm", (data) => {
    TripService.emit('tripTogetherConfirm', data);
  });

  socket.on("tripTogetherConfirmProgress", (data) => {
    TripService.emit('tripTogetherConfirmProgress', data);
  });

  TripService.on("tripTogetherCancel", (data) => {
    socket.emit('tripTogetherCancel', data);
  });

  TripService.on("tripTogetherDone", (data) => {
    socket.emit('tripTogetherDone', data);
  });

  // rate
  socket.on("rateBegin", (data) => {
    TripService.emit('rateBegin', data);
  });

  TripService.on("rateDone", (data) => {
    socket.emit('rateDone', data);
  });
}

export default TripServiceInit;
