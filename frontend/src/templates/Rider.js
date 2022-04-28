import React, {Component, useEffect} from 'react';
import '../styles/App.css'
import TripServiceInit from '../components/TripService/TripServiceInit';
import Map from '../components/Map/Map'
import CostEstimation from '../components/Map/CostEstimation'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import Rate from '../components/Rate/Rate'
import Button from '../components/RequestRideButton/Button'
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
    TripServiceInit();

    TripService.on('destinationSelected', (data) => {
      console.log("destinationSelected Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <> < CostEstimation  />< p className = "requestButtonPositioning" > <Button/></p>
      </>
      });
    });

    TripService.on('tripBeginRider', (data) => {
      console.log("tripBeginRider Data Received:");
      console.log(data);
      this.setState({
        tripBlock: <p>Trip Started!</p>
      });
    });

    TripService.on('tripEndRider', (data) => {
      console.log("tripBeginRider Data Received:");
      console.log(data);
      this.setState({tripBlock: <Rate/>});
    });
  };

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
