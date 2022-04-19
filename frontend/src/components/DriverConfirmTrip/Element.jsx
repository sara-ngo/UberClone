import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './element.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "No rider matched yet."
    }

    TripService.on('requestRideDriverConfirm', (data) => {
      console.log("requestRideDriverConfirm Data Received:");
      console.log(data);
      this.setState({message: data.message});
    });

    TripService.on('confirmTripProgress', (data) => {
      console.log("confirmTripProgress Data Received:");
      console.log(data);
      this.setState({message: data.message});
    });

  }

  confirmTrip = () => {
    TripService.emit('confirmTrip', {});
  }

  render() {
    return (
      <>
        <div className="DriverConfirmTrip">
          <span className="message">{this.state.message}</span>
          <button className="button" onClick={this.confirmTrip}>Confirm Trip</button>
        </div>
      </>
    )
  }
}

export default App;
