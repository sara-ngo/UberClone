import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import DriverInstructions from '../components/DriverInstructions/DriverInstructions'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'
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

  componentDidMount = () => {
    TripService.on('requestRideConfirm', (data) => {
      console.log("requestRideConfirm Data Received:");
      console.log(data);
      this.setState({tripBlock: <DriverConfirmTrip />});
    });

    TripService.on('tripDriverToRiderBegin', (data) => {
      console.log("tripDriverToRiderBegin Data Received:");
      console.log(data);
      this.setState({tripBlock: <p>Drive to the rider's location to begin the trip.</p>});
    });

    TripService.on('tripDriverToRiderProgress', (data) => {
      console.log("tripDriverToRiderProgress Data Received:");
      console.log(data);
    });

    TripService.on('tripDriverToRiderCancel', (data) => {
      console.log("tripDriverToRiderCancel Data Received:");
      console.log(data);
      this.setState({tripBlock: <p>Ride was cancelled! Waiting for a rider to request you.</p>});
    });

    TripService.on('tripDriverToRiderConfirm', (data) => {
      console.log("tripDriverToRiderConfirm Data Received:");
      console.log(data);
      this.setState({tripBlock: <p>Click the button to confirm you have picked up the rider</p>});
    });

    TripService.on('tripDriverToRiderConfirmProgress', (data) => {
      console.log("tripDriverToRiderConfirmProgress Data Received:");
      console.log(data);
    });
  };

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
