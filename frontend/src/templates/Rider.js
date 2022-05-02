import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import Map from '../components/Map/Map'
import CostEstimation from '../components/CostEstimation/CostEstimation'
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

  destinationSelected = (data) => {
    console.log("destinationSelected Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <> < CostEstimation />< p className = "requestButtonPositioning" > <RequestRideButton destLong={data.end.long} destLat={data.end.lat}/></p>
    </>
    });
  }

  requestRideProgress = (data) => {
    console.log("requestRideProgress Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
    });
  }

  requestRideCancel = (data) => {
    console.log("requestRideCancel Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
    });
  }

  tripDriverToRiderBegin = (data) => {
    console.log("tripDriverToRiderBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <p>Driver found! Driver is coming to pick you up!</p>,
      chatBlock: <Chat/>
    });
  }

  tripDriverToRiderProgress = (data) => {
    console.log("tripDriverToRiderProgress Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <p>tripDriverToRiderProgress</p>
    });
  }

  tripDriverToRiderCancel = (data) => {
    console.log("tripDriverToRiderCancel Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <> < CostEstimation />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
    </>
    });
  }

  tripTogetherBegin = (data) => {
    console.log("tripTogetherBegin Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <p>You have been picked up! Trip started to destination!</p>
    });
  }

  tripTogetherProgress = (data) => {
    console.log("tripTogetherProgress Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <p>tripTogetherProgress</p>
    });
  }

  tripTogetherCancel = (data) => {
    console.log("tripTogetherCancel Data Received:");
    console.log(data);
    this.setState({
      messageBlock: data.message,
      tripBlock: <> < CostEstimation />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
    </>
    });
  }

  tripEndRider = (data) => {
    console.log("tripBeginRider Data Received:");
    console.log(data);
    this.setState({tripBlock: <Rate/>});
  }

  componentDidMount = () => {
    TripService.on('destinationSelected', this.destinationSelected);
    TripService.on('requestRideProgress', this.requestRideProgress);
    TripService.on('requestRideCancel', this.requestRideCancel);
    TripService.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.on('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.on('tripDriverToRiderCancel', this.tripDriverToRiderCancel);
    TripService.on('tripTogetherBegin', this.tripTogetherBegin);
    TripService.on('tripTogetherProgress', this.tripTogetherProgress);
    TripService.on('tripTogetherCancel', this.tripTogetherCancel);
    TripService.on('tripEndRider', this.tripEndRider);
  };

  componentWillUnmount = () => {
    TripService.off('destinationSelected', this.destinationSelected);
    TripService.off('requestRideProgress', this.requestRideProgress);
    TripService.off('requestRideCancel', this.requestRideCancel);
    TripService.off('tripDriverToRiderBegin', this.tripDriverToRiderBegin);
    TripService.off('tripDriverToRiderProgress', this.tripDriverToRiderProgress);
    TripService.off('tripDriverToRiderCancel', this.tripDriverToRiderCancel);
    TripService.off('tripTogetherBegin', this.tripTogetherBegin);
    TripService.off('tripTogetherProgress', this.tripTogetherProgress);
    TripService.off('tripTogetherCancel', this.tripTogetherCancel);
    TripService.off('tripEndRider', this.tripEndRider);
  }

  render() {
    return (<> < Navbar />
    <r-c join="join">
      <main data-md2-3="data-md2-3" className="main-content no-padding">
        <Map text='rider'/>
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
            <a href="#">Contact</a>
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
