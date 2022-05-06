import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import DriverInstructions from '../components/DriverInstructions/DriverInstructions'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'
import RidePickupConfirmButton from '../components/RidePickupConfirmButton/Button'
import TripService from '../components/TripService/emitter';
import Rate from '../components/Rate/Rate'

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class App extends Component {
  constructor(props) {
    super(props);

    this.abort = false;
    this.userLong = 0.0;
    this.userLat = 0.0;
    this.endLong = 0.0;
    this.endLat = 0.0;
    this.type = "driver";

    this.state = {
      tripBlock: <p>Waiting for a rider to request you.</p>
    }

    this.positionUpdateLoop();
  }

  positionUpdate = () => {
    TripService.emit("positionUpdate", {
      "long": this.userLong,
      "lat": this.userLat,
      "type": this.type,
      "token": localStorage.getItem("token")
    });
  }

  async positionUpdateLoop() {
    while (this.abort === false) {
      this.positionUpdate();
      await sleep(3000);
    }
  }

  initialState = () => {
    this.setState({
      "messageBlock": "", "chatBlock": "", "tripBlock": <p>Waiting for a rider to request you.</p>
    });
  }

  onGeolocatePositionUpdate = (data) => {
    this.userLong = data.long;
    this.userLat = data.lat;
    this.positionUpdate();
  }

  requestRideConfirm = (data) => {
    console.log("requestRideConfirm Data Received:");
    console.log(data);
    if (data.tripId === undefined) {
      console.log("requestRideConfirm ERROR");
      return;
    }
    this.setState({tripBlock: <DriverConfirmTrip tripId={data.tripId}/>});
  }

  tripDriverToRiderBegin = (data) => {
    console.log("tripDriverToRiderBegin Data Received:");
    console.log(data);
    TripService.emit('setDestination', {
      "routeEndLong": data.riderLong,
      "routeEndLat": data.riderLat
    });
    this.setState({
      chatBlock: <Chat/>,
      tripBlock: <p>Drive to the rider's location to begin the trip.</p>
    });
  }

  tripDriverToRiderProgress = (data) => {
    console.log("tripDriverToRiderProgress Data Received:");
    console.log(data);
  }

  tripDriverToRiderStop = (data) => {
    console.log("tripDriverToRiderStop Data Received:");
    console.log(data);
    this.initialState();
  }

  tripDriverToRiderConfirm = (data) => {
    console.log("tripDriverToRiderConfirm Data Received:");
    console.log(data);
    this.setState({
      tripBlock: <p className="RidePickupConfirmButtonPositioning">
          <RidePickupConfirmButton/></p>
    });
  }

  tripDriverToRiderConfirmProgress = (data) => {
    console.log("tripDriverToRiderConfirmProgress Data Received:");
    console.log(data);
    this.setState({messageBlock: data.message});
  }

  tripTogetherBegin = (data) => {
    console.log("tripTogetherBegin Data Received:");
    console.log(data);
    this.endLong = data.endLong;
    this.endLat = data.endLat;
    TripService.emit('setDestination', {
      "routeEndLong": this.endLong,
      "routeEndLat": this.endLat
    });
    this.setState({
      messageBlock: data.message,
      tripBlock: <><DriverInstructions/><p> Drive to the destination at({
        this.endLat
      }, {this.endLong})</p></>
    });
  }

  tripTogetherProgress = (data) => {
    console.log("tripTogetherProgress Data Received:");
    console.log(data);
  }

  tripTogetherStop = (data) => {
    console.log("tripTogetherStop Data Received:");
    console.log(data);
    this.initialState();
  }

  rateBegin = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message, chatBlock: "", tripBlock: <><p> Rate your rider: </p><Rate tripId={data.tripId}/></>
    });
  }

  rateDone = (data) => {
    console.log("rateBegin Data Received:");
    console.log(data);
    this.initialState();
  }

  componentDidMount = () => {
    this.abort = false;
    TripService.on('onGeolocatePositionUpdate', this.onGeolocatePositionUpdate);
    TripService.on('requestRideConfirm', this.requestRideConfirm);
    TripService.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.on('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.on('tripDriverToRiderStop', this.tripDriverToRiderStop);
    TripService.on('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm);
    TripService.on('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
    TripService.on('tripTogetherBegin', this.tripTogetherBegin);
    TripService.on('tripTogetherProgress', this.tripTogetherProgress);
    TripService.on('tripTogetherStop', this.tripTogetherStop);
    TripService.on('rateBegin', this.rateBegin);
    TripService.on('rateDone', this.rateDone);
  };

  componentWillUnmount = () => {
    this.abort = true;
    TripService.off('onGeolocatePositionUpdate', this.onGeolocatePositionUpdate);
    TripService.off('requestRideConfirm', this.requestRideConfirm);
    TripService.off('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.off('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.off('tripDriverToRiderStop', this.tripDriverToRiderStop);
    TripService.off('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm);
    TripService.off('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
    TripService.off('tripTogetherBegin', this.tripTogetherBegin);
    TripService.off('tripTogetherProgress', this.tripTogetherProgress);
    TripService.off('tripTogetherStop', this.tripTogetherStop);
    TripService.off('rateBegin', this.rateBegin);
    TripService.off('rateDone', this.rateDone);
  }

  render() {
    return (<> < Navbar /> <r-c join="join">
      <main data-md2-3="data-md2-3" className="main-content no-padding">
        <Map userType='driver'/>
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
            <a href="https://matthewjamestaylor.com/responsive-columns" target="_blank" rel="noopener"> Responsive Columns</a>.</small>
        </p>
      </c1-1>
    </footer>
  </>);
  }
}

export default App;
