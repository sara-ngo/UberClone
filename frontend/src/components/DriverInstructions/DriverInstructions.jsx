import React, {Component, useEffect} from 'react';
import TripService from '../TripService/emitter';

let tripEstimateData = {};
let steps = [];

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      "tripDuration": "",
      "tripDistance": "",
      "instructions": ""
    }
  }

  componentDidMount = () => {
    TripService.on('tripEstimateData', (data) => {
      tripEstimateData = data.data;
      var tripDuration = Math.floor(tripEstimateData.duration / 60);
      var tripDistance = Math.floor(tripEstimateData.distance / 1000);

      const tripInstructions = tripEstimateData.legs[0].steps.map((step) =>
          <li key={step.maneuver.instruction}>{step.maneuver.instruction}</li>
      );

      this.setState({"tripDuration": `Trip duration: ${tripDuration} minutes`, "tripDistance": `Trip distance: ${tripDistance} miles`, "instructions": tripInstructions});
    });
  };

  render = () => {
    return (<><p>{this.state.tripDuration}</p>
    <p>{this.state.tripDistance}</p>
    <p>Driving instructions:</p>
    <ol className="instructions">{this.state.instructions}</ol></>)
  }
}

export default App;
