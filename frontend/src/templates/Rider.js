import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
import Navbar from '../components/Navbar/Navbar'


function Rider() {
  return (
    <div>
        <Navbar />
        <Map text='rider'/>
    </div>
  );
}

export default Rider;
