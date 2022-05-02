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

  componentDidMount = () => {
    TripService.on('destinationSelected', (data) => {
      console.log("destinationSelected Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <> < CostEstimation  />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
      </>
      });
    });

    TripService.on('tripDriverToRiderBegin', (data) => {
      console.log("tripDriverToRiderBegin Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <p>Driver found! Driver is coming to pick you up!</p>
      });
    });

    TripService.on('tripDriverToRiderProgress', (data) => {
      console.log("tripDriverToRiderProgress Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <p>tripDriverToRiderProgress</p>
      });
    });

    TripService.on('tripDriverToRiderCancel', (data) => {
      console.log("tripDriverToRiderCancel Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <> < CostEstimation  />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
      </>
      });
    });

    TripService.on('tripTogetherBegin', (data) => {
      console.log("tripTogetherBegin Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <p>You have been picked up! Trip started to destination!</p>
      });
    });

    TripService.on('tripTogetherProgress', (data) => {
      console.log("tripTogetherProgress Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <p>tripTogetherProgress</p>
      });
    });

    TripService.on('tripTogetherCancel', (data) => {
      console.log("tripTogetherCancel Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <> < CostEstimation  />< p className = "requestButtonPositioning" > <RequestRideButton/></p>
      </>
      });
    });

    TripService.on('tripEndRider', (data) => {
      console.log("tripBeginRider Data Received:");
      console.log(data);
      this.setState({tripBlock: <Rate/>});
    });
  };

  componentWillUnmount = () => {
    TripService.off('destinationSelected');
    TripService.off('tripDriverToRiderBegin');
    TripService.off('tripDriverToRiderProgress');
    TripService.off('tripDriverToRiderCancel');
    TripService.off('tripTogetherBegin');
    TripService.off('tripTogetherProgress');
    TripService.off('tripTogetherCancel');
    TripService.off('tripEndRider');
  }

  render() {
    return (
      <>
      <Navbar />
      <r-c>Please select a destination</r-c>
      <r-c join>
          <main data-md2-3 className="main-content no-padding">
              <Map text='rider'/>
          </main>
          <aside data-md1-3 data-md1 className="left-sidebar">
              <Chat />
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
