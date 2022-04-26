import React, {
  useRef,
  useEffect,
  useState
} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

function requestRide() {
  TripService.emit('requestRide', {
  });
}

function Button() {
  useEffect(() => {
    TripService.on('requestRideProgress', (data) => {
      console.log("requestRideProgress Data Received:");
      console.log(data);
    });
  }, []);

  return (
    <>
      <button className="RequestRideButton" onClick={requestRide}>Request</button>
    </>
  )
}

export default Button;
