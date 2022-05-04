import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import RideTypeSelection from '../components/RideTypeSelection/RideTypeSelection'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import Rate from '../components/Rate/Rate'
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

    this.state = {
      tripBlock: <p>Select a map position as your destination.</p>
    }

  }

  initialState = () => {
    this.setState({
      "messageBlock": "", "chatBlock": "", "tripBlock": <p>Select a map position as your destination.</p>
    });
  }

  destinationSelected = (data) => {
    // console.log("destinationSelected Data Received:");
    // console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <> < p > Trip Stats: </p>
      <p>
        {
        this.state.tripDuration
      } < br /> {
        this.state.tripDistance
      }</p><p> Select Ride Type: </p> < RideTypeSelection />< p className = "requestButtonPositioning" > <RequestRideButton destLong={data.routeEndLong} destLat={data.routeEndLat}/></p>
    </>
    });
  }

  tripEstimateData = (data) => {
    this.tripEstimateData = data.data;
    let tripDuration = Math.floor(this.tripEstimateData.duration / 60);
    let tripDistance = Math.floor(this.tripEstimateData.distance / 1000);

    this.setState({tripDuration: `Trip duration: ${tripDuration} minutes`, tripDistance: `Trip distance: ${tripDistance} miles`});
  }

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
    this.setState({messageBlock: data.message});
  }

  requestRideStop = (data) => {
    console.log("requestRideStop Data Received:");
    console.log(data);
    this.setState({messageBlock: data.message});
  }

  tripDriverToRiderBegin = (data) => {
    console.log("tripDriverToRiderBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, tripBlock: <p>Driver found! Driver is coming to pick you up!</p>,
      chatBlock: <Chat/>
    });
  }

  tripDriverToRiderProgress = (data) => {
    console.log("tripDriverToRiderProgress Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, tripBlock: <p>tripDriverToRiderProgress</p>
    });
  }

  tripDriverToRiderStop = (data) => {
    console.log("tripDriverToRiderStop Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <> < RideTypeSelection />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
    </>
    });
  }

  tripTogetherBegin = (data) => {
    console.log("tripTogetherBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, tripBlock: <p>You have been picked up! Trip started to destination!</p>
    });
  }

  tripTogetherProgress = (data) => {
    console.log("tripTogetherProgress Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, tripBlock: <p>tripTogetherProgress</p>
    });
  }

  tripTogetherStop = (data) => {
    console.log("tripTogetherStop Data Received:");
    console.log(data);
    this.initialState();
  }

  tripEndRider = (data) => {
    console.log("tripBeginRider Data Received:");
    console.log(data);
    this.setState({tripBlock: <Rate/>});
  }

  rateBegin = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, chatBlock: "", tripBlock: <><p> Rate your driver: </p><Rate tripId={data.tripId}/></>
    });
  }

  rateDone = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
    this.initialState();
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
        {this.state.messageBlock}{this.state.chatBlock}
        {this.state.tripBlock}
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
