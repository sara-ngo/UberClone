import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

import './button.css'

function buttonPress() {
  TripService.emit('tripDriverToRiderConfirmDone', {});
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      "className": "RidePickupConfirmButton",
      "buttonText": "Rider Picked Up"
    }
  }

  tripDriverToRiderConfirmProgress = (data) => {
    console.log("tripDriverToRiderConfirmProgress Data Received:");
    console.log(data);
    this.setState({"className": "RidePickupConfirmButtonDisable", "buttonText": data.message});
  }

  componentDidMount = () => {
    TripService.on('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
  };

  componentWillUnmount = () => {
    TripService.off('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
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
