import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
import {MapNavigation, getRoute} from '../components/Map/Navigation'

function Rider() {
  return (
    <div>
        <p>Rider - from Rider.js</p>
        <Map/>
        <MapNavigation end="TEST ATTRIBUTE"/>
    </div>
  );
}

export default Rider;
