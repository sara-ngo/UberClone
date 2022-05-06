import React, {Component} from 'react';
import TripService from '../TripService/emitter';

import './element.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.tripId = props.tripId;
    this.state = {
      message: "No rider matched yet."
    }
  }

  confirmTrip = () => {
    TripService.emit('requestRideDone', {"tripId": this.tripId});
  }

  requestRideConfirm = (data) => {
    console.log("requestRideConfirm Data Received:");
    console.log(data);
    this.tripId = data.tripId;
    this.setState({message: data.message});
  }

  requestRideConfirmProgress = (data) => {
    console.log("requestRideConfirmProgress Data Received:");
    console.log(data);
    this.setState({message: data.message});
  }

  componentDidMount = () => {
    TripService.on('requestRideConfirm', this.requestRideConfirm);
    TripService.on('requestRideConfirmProgress', this.requestRideConfirmProgress);
  };

  componentWillUnmount = () => {
    TripService.off('requestRideConfirm', this.requestRideConfirm);
    TripService.off('requestRideConfirmProgress', this.requestRideConfirmProgress);
  }

  render() {
    return (<> < button className = "button" onClick = {
      this.confirmTrip
    } > Confirm Trip</button> < />)
  }
}

export default App;
