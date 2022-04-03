import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
<<<<<<< HEAD
import Navbar from '../components/Navbar';

=======
import {MapNavigation, getRoute} from '../components/Map/Navigation'
>>>>>>> 721b05810a8676a1ec9bdf264db14f69ba7acd2c

function Rider() {
  return (
    <div>
        <p>Rider - from Rider.js</p>
<<<<<<< HEAD
        <Navbar />
        <Map text='rider'/>
=======
        <Map/>
        <MapNavigation end="TEST ATTRIBUTE"/>
>>>>>>> 721b05810a8676a1ec9bdf264db14f69ba7acd2c
    </div>
  );
}

export default Rider;
