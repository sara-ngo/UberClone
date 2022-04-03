import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
import Navbar from '../components/Navbar';


function Rider() {
  return (
    <div>
        <p>Rider - from Rider.js</p>
        <Navbar />
        <Map text='rider'/>
    </div>
  );
}

export default Rider;