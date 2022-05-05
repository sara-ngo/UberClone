import React, {Component, useEffect} from 'react';
import axios from "axios";
import Map from '../components/Map/Map'
import DriverInstructions from '../components/DriverInstructions/DriverInstructions'
import RideTypeSelection from '../components/RideTypeSelection/RideTypeSelection'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import Rate from '../components/Rate/Rate'
import StarRating from '../components/StarRating/StarRating'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'
import RidePickupConfirmButton from '../components/RidePickupConfirmButton/Button'
import RequestRideButton from '../components/RequestRideButton/Button'
import TripService from '../components/TripService/emitter';
import * as Constants from "../constants.js"

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

export const MapContext = React.createContext();

/* BRAD: This page is for testing all the components available */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      "tripDuration": "",
      "tripDistance": ""
    }
  }

  destinationSelected = (data) => {
    console.log("destinationSelected Data Received:");
    console.log(data);
  }

  tripEstimateData = (data) => {
    this.tripEstimateData = data.data;
    let tripDuration = Math.floor(this.tripEstimateData.duration / 60);
    let tripDistance = Math.floor(this.tripEstimateData.distance / 1000);

    this.setState({"tripDuration": `Trip duration: ${tripDuration} minutes`, "tripDistance": `Trip distance: ${tripDistance} miles`});
  }

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
  }

  requestRideStop = (data) => {
    console.log("requestRideStop Data Received:");
    console.log(data);
  }

  tripDriverToRiderBegin = (data) => {
    console.log("tripDriverToRiderBegin Data Received:");
    console.log(data);
  }

  tripDriverToRiderProgress = (data) => {
    console.log("tripDriverToRiderProgress Data Received:");
    console.log(data);
  }

  tripDriverToRiderStop = (data) => {
    console.log("tripDriverToRiderStop Data Received:");
    console.log(data);
  }

  tripTogetherBegin = (data) => {
    console.log("tripTogetherBegin Data Received:");
    console.log(data);
  }

  tripTogetherProgress = (data) => {
    console.log("tripTogetherProgress Data Received:");
    console.log(data);
  }

  tripTogetherStop = (data) => {
    console.log("tripTogetherStop Data Received:");
    console.log(data);
  }

  tripEndRider = (data) => {
    console.log("tripBeginRider Data Received:");
    console.log(data);
  }

  rateBegin = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
  }

  rateDone = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
  }

  rateUser = (newRating) => {
    console.log("rateUser", newRating);
    axios.post(Constants.AUTHENTICATION_SERVER + "/rate", {
      wasRider: true,
      userID: 0,
      tripID: 0,
      rating: newRating
    }).then((res) => {
      console.log("rateUser Data Received:");
      console.log(res.data);
    });
  }

  componentDidMount = () => {
    TripService.on('destinationSelected', this.destinationSelected);
    TripService.on("tripEstimateData", this.tripEstimateData);
    TripService.on('requestRideProgress', this.requestRideProgress);
    TripService.on('requestRideStop', this.requestRideStop);
    TripService.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.on('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.on('tripDriverToRiderStop', this.tripDriverToRiderStop);
    TripService.on('tripTogetherBegin', this.tripTogetherBegin);
    TripService.on('tripTogetherProgress', this.tripTogetherProgress);
    TripService.on('tripTogetherStop', this.tripTogetherStop);
    TripService.on('rateBegin', this.rateBegin);
    TripService.on('rateDone', this.rateDone);
  };

  componentWillUnmount = () => {
    TripService.off('destinationSelected', this.destinationSelected);
    TripService.off("tripEstimateData", this.tripEstimateData);
    TripService.off('requestRideProgress', this.requestRideProgress);
    TripService.off('requestRideStop', this.requestRideStop);
    TripService.off('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.off('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.off('tripDriverToRiderStop', this.tripDriverToRiderStop);
    TripService.off('tripTogetherBegin', this.tripTogetherBegin);
    TripService.off('tripTogetherProgress', this.tripTogetherProgress);
    TripService.off('tripTogetherStop', this.tripTogetherStop);
    TripService.off('rateBegin', this.rateBegin);
    TripService.off('rateDone', this.rateDone);
  }

  render() {
    return (<> < Navbar /> <r-c join="join">
      <main data-md2-3="data-md2-3" className="main-content no-padding">
        <Map userType='rider'/>
      </main>
      <aside data-md1-3="data-md1-3" data-md1="data-md1" className="left-sidebar">
        < p >
          Trip Stats:
        </p>
        <p>
          {this.state.tripDuration}
          < br/> {this.state.tripDistance}</p>
        <p>RideTypeSelection:</p>
        <RideTypeSelection/>
        <p>RequestRideButton:</p>
        <RequestRideButton destLong="0" destLat="0"/>
        <p>DriverConfirmTrip:</p>
        <DriverConfirmTrip tripId="0"/>
        <p>DriverInstructions:</p>
        <DriverInstructions/>
        <p>RidePickupConfirmButton:</p>
        <RidePickupConfirmButton/>
        <p>Chat:</p>
        <Chat/>
        <p>Rate:</p>
        <Rate tripId="0"/>
        <p>StarRating:</p>
        <StarRating id="0" rateUser={this.rateUser}/>
      </aside>
    </r-c>
    <footer data-r-c="data-r-c" data-join="data-join" className="footer">
      <c1-1>
        <ul className="menu-links">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="/ComponentTesting">Testing</a>
          </li>
          <li>
            <a href="#">Privacy</a>
          </li>
        </ul>
        <p>
          <small>Made with
            <a href="https://matthewjamestaylor.com/responsive-columns" target="_blank" rel="noopener">Responsive Columns</a>.</small>
        </p>
      </c1-1>
    </footer>
  </>);
  }
}

export default App;
