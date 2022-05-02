import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import DriverInstructions from '../components/DriverInstructions/DriverInstructions'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'
import RidePickupConfirmButton from '../components/RidePickupConfirmButton/Button'
import TripService from '../components/TripService/emitter';

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tripBlock: <p>Waiting for a rider to request you.</p>
    }
  }

  requestRideConfirm = (data) => {
    console.log("requestRideConfirm Data Received:");
    console.log(data);
    if(data.tripId === undefined){
      console.log("requestRideConfirm ERROR");
      return ;
    }
    this.setState({tripBlock: <DriverConfirmTrip tripId={data.tripId}/>});
  }

  tripDriverToRiderBegin = (data) => {
    console.log("tripDriverToRiderBegin Data Received:");
    console.log(data);
    this.setState({tripBlock: <p>Drive to the rider's location to begin the trip.</p>});
  }

  tripDriverToRiderProgress = (data) => {
    console.log("tripDriverToRiderProgress Data Received:");
    console.log(data);
  }

  tripDriverToRiderCancel = (data) => {
    console.log("tripDriverToRiderCancel Data Received:");
    console.log(data);
    this.setState({tripBlock: <p>Ride was cancelled! Waiting for a rider to request you.</p>});
  }

  tripDriverToRiderConfirm = (data) => {
    console.log("tripDriverToRiderConfirm Data Received:");
    console.log(data);
    this.setState({tripBlock: < p className = "RidePickupConfirmButtonPositioning" > <RidePickupConfirmButton/></p>});
  }

  tripDriverToRiderConfirmProgress = (data) => {
    console.log("tripDriverToRiderConfirmProgress Data Received:");
    console.log(data);
    this.setState({messageBlock: data.message});
  }

  componentDidMount = () => {
    TripService.on('requestRideConfirm', this.requestRideConfirm);
    TripService.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.on('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.on('tripDriverToRiderCancel', this.tripDriverToRiderCancel);
    TripService.on('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm);
    TripService.on('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
  };

  componentWillUnmount = () => {
    TripService.off('requestRideConfirm', this.requestRideConfirm);
    TripService.off('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.off('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.off('tripDriverToRiderCancel', this.tripDriverToRiderCancel);
    TripService.off('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm);
    TripService.off('tripDriverToRiderConfirmProgress', this.tripDriverToRiderConfirmProgress);
  }

  render() {
  return (
    <>
    <Navbar />
    <r-c join>
        <main data-md2-3 className="main-content no-padding">
            <Map text='driver'/>
        </main>
        <aside data-md1-3 data-md1 className="left-sidebar">
          <Chat />
          <DriverInstructions />
            {this.state.messageBlock}{this.state.chatBlock}
            {this.state.tripBlock}
        </aside>
    </r-c>
    <footer data-r-c data-join className="footer">
        <c1-1>
            <ul className="menu-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
            </ul>
            <p><small>Made with <a href="https://matthewjamestaylor.com/responsive-columns" target="_blank" rel="noopener">Responsive Columns</a>.</small></p>
        </c1-1>
    </footer>
    </>
  );
}
}

export default App;
