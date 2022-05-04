import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import DriverInstructions from '../components/DriverInstructions/DriverInstructions'
import CostEstimation from '../components/CostEstimation/CostEstimation'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import Rate from '../components/Rate/Rate'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'
import RidePickupConfirmButton from '../components/RidePickupConfirmButton/Button'
import RequestRideButton from '../components/RequestRideButton/Button'
import TripService from '../components/TripService/emitter';

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

export const MapContext = React.createContext();

class App extends Component {
  constructor(props) {
    super(props);
  }

  destinationSelected = (data) => {
    console.log("destinationSelected Data Received:");
    console.log(data);
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

  componentDidMount = () => {
    TripService.on('destinationSelected', this.destinationSelected);
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
        <p>CostEstimation:</p>
        <CostEstimation/>
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
