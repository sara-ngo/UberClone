import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

let rideType = "";
let rideCost = 0.0;
let rideRequested = false;
let destLat = 0.0;
let destLong = 0.0;

function buttonPress() {
  if (!rideRequested) {
    TripService.emit('requestRide', {
      "rideType": rideType,
      "rideCost": rideCost,
      "destLat" : destLat,
      "destLong" : destLong
    });
  } else {
    TripService.emit('cancelRide', {});
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    destLat = props.destLat;
    destLong = props.destLong;

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
    rideRequested = true;
    this.setState({"className": "CancelRideButton", "buttonText": `${data.message} (CLICK TO CANCEL)`});
  }

  chooseRideType = (data) => {
    rideType = data.rideType;
    rideCost = data.cost;
    this.setState({"className": "RequestRideButton", "buttonText": `Request ${rideType} @ $${rideCost.toFixed(2)}`});
  }

  componentDidMount = () => {
    TripService.on('requestRideProgress', this.requestRideProgress);
    TripService.on('chooseRideType', this.chooseRideType);
  };

  componentWillUnmount = () => {
    TripService.off('requestRideProgress', this.requestRideProgress);
    TripService.off('chooseRideType', this.chooseRideType);
  }

  render = () => {
    return (<> < button className = {
      this.state.className
    }
    onClick = {
      buttonPress
    } > {
      this.state.buttonText
    }</button> < />)
  }
  }

  export default App;
