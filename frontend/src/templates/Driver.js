import React from 'react'
import '../styles/App.css'
import MapPositionInit from '../components/MapPosition/MapPosition';
import Map from '../components/Map/Map'
import MapInstructions from '../components/Map/MapInstructions'
import Chat from '../components/Chat/Chat'
import Navbar from '../components/Navbar/Navbar'

import '../styles/matthewjamestaylor/column-styles.css'
import '../styles/matthewjamestaylor/r-c.css'
import '../styles/matthewjamestaylor/r-c-min.css'
import '../styles/matthewjamestaylor/site-styles.css'

function Driver() {
  // initialize the MapPosition socket client
  MapPositionInit();

  return (
    <>
    <Navbar />
    <r-c join>
        <main data-md2-3 class="main-content no-padding">
            <Map text='driver'/>
        </main>
        <aside data-md1-3 data-md1 class="left-sidebar">
            <Chat />
            <MapInstructions />
        </aside>
    </r-c>
    <footer data-r-c data-join class="footer">
        <c1-1>
            <ul class="menu-links">
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
