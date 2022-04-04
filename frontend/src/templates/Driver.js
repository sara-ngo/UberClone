import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
import Navbar from '../components/Navbar';

function Driver() {
  return (
    <div>
        <Navbar />
        <Map text='driver'/>
    </div>
  );
}

export default Driver;