import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.rideType = "";
    this.rideCost = 0.0;
    this.rideRequested = false;
    this.destLat = props.destLat;
    this.destLong = props.destLong;

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

buttonPress  = () => {
  if (!this.rideRequested) {
    TripService.emit('requestRide', {
      "rideType": this.rideType,
      "rideCost": this.rideCost,
      "destLat" : this.destLat,
      "destLong" : this.destLong
    });
    this.rideRequested = true;
  } else {
    TripService.emit('requestRideCancel', {});
  }
}

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
    this.setState({"className": "CancelRideButton", "buttonText": `${data.message} (CLICK TO CANCEL)`});
  }

  chooseRideType = (data) => {
    this.rideType = data.rideType;
    this.rideCost = data.cost;
    this.setState({"className": "RequestRideButton", "buttonText": `Request ${this.rideType} @ $${this.rideCost.toFixed(2)}`});
  }

  componentDidMount = () => {
    this.rideRequested = false;
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
      this.buttonPress
    } > {
      this.state.buttonText
    }</button> < />)
  }
  }

  export default App;
