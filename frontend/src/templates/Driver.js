import React from 'react'
import '../styles/App.css'
import TripServiceInit from '../components/TripService/TripServiceInit';
import Map from '../components/Map/Map'
import MapInstructions from '../components/Map/MapInstructions'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'
import DriverConfirmTrip from '../components/DriverConfirmTrip/Element'

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

function Driver() {
  // initialize the TripService socket client
  TripServiceInit();

  return (
    <>
    <Navbar />
    <r-c join>
        <main data-md2-3 className="main-content no-padding">
            <Map text='driver'/>
        </main>
        <aside data-md1-3 data-md1 className="left-sidebar">
            <Chat />
            <MapInstructions />
            <DriverConfirmTrip />
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

export default Driver;
