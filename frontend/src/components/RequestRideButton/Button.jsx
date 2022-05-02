import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

let rideType = "";
let rideCost = 0.0;
let rideRequested = false;

function buttonPress() {
  if (!rideRequested) {
    TripService.emit('requestRide', {
      "rideType": rideType,
      "rideCost": rideCost
    });
  } else {
    TripService.emit('cancelRide', {});
  }
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

  componentDidMount = () => {
    TripService.on('requestRideProgress', (data) => {
      console.log("requestRideProgress Data Received:");
      console.log(data);
      rideRequested = true;
      this.setState({"className": "CancelRideButton", "buttonText": `${data.message} (CLICK TO CANCEL)`});
    });

    TripService.on('chooseRideType', (data) => {
      rideType = data.rideType;
      rideCost = data.cost;
      this.setState({"className": "RequestRideButton", "buttonText": `Request ${rideType} @ $${rideCost.toFixed(2)}`});
    });
  };

  componentWillUnmount = () => {
    TripService.off('requestRideProgress');
    TripService.off('chooseRideType');
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
