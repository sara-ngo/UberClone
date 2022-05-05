import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.tripType = "";
    this.tripCost = 0.0;
    this.rideRequested = false;
    this.tripDistance = 0.0;
    this.tripDuration = 0.0;
    this.routeStartLat = props.routeStartLat;
    this.routeStartLong = props.routeStartLong;
    this.routeEndLat = props.routeEndLat;
    this.routeEndLong = props.routeEndLong;

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

  buttonPress = () => {
    if (!this.rideRequested) {
      TripService.emit('requestRide', {
        "type": this.tripType,
        "cost": this.tripCost,
        "startLat": this.routeStartLat,
        "startLong": this.routeStartLong,
        "endLat": this.routeEndLat,
        "endLong": this.routeEndLong,
        "distance": this.tripDistance,
        "duration": this.tripDuration
      });
      this.rideRequested = true;
    } else {
      TripService.emit('requestRideCancel', {});
    }
  }

  destinationSelected = (data) => {
    //console.log("destinationSelected Data Received:");
    //console.log(data);
    this.routeStartLat = data.routeStartLat;
    this.routeStartLong = data.routeStartLong;
    this.routeEndLat = data.routeEndLat;
    this.routeEndLong = data.routeEndLong;
  }

  tripEstimateData = (data) => {
    this.tripDuration = Math.floor(data.data.duration / 60);
    this.tripDistance = Math.floor(data.data.distance / 1000);
  }

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
    this.setState({"className": "CancelRideButton", "buttonText": `${data.message} (CLICK TO CANCEL)`});
  }

  chooseRideType = (data) => {
    this.tripType = data.rideType;
    this.tripCost = data.cost;
    this.setState({"className": "RequestRideButton", "buttonText": `Request ${this.tripType} @ $${this.tripCost.toFixed(2)}`});
  }

  componentDidMount = () => {
    this.rideRequested = false;
    TripService.on('destinationSelected', this.destinationSelected);
    TripService.on("tripEstimateData", this.tripEstimateData);
    TripService.on('requestRideProgress', this.requestRideProgress);
    TripService.on('chooseRideType', this.chooseRideType);
  };

  componentWillUnmount = () => {
    TripService.off('destinationSelected', this.destinationSelected);
    TripService.off("tripEstimateData", this.tripEstimateData);
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
