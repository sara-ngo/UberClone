import React from 'react'
import { Route, Routes, Navigate } from "react-router-dom";

import Signup from "./templates/Signup";
import Login from "./templates/Login";
import Profile from "./templates/Profile";
import DriverSignup from "./templates/DriverSignup";
import Home from './templates/Home';
import Rider from './templates/Rider'
import Driver from './templates/Driver'
import ComponentTesting from './templates/ComponentTesting.js'

import './styles/App.css'

import TripServiceInit from './components/TripService/TripServiceInit';

// Initialize the trip service only once!
// It also imports the trip socket and makes a connection to the server!
TripServiceInit();

function App() {
  const user = localStorage.getItem("token");
  return (
    <Routes>
      {user && <Route path="/" exact element={<Rider />} />}
			  <Route path="/signup" exact element={<Signup />} />
			  <Route path="/login" exact element={<Login />} />
			  <Route path="/" element={<Navigate replace to="/login" />} />
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/Profile' element={<Profile/>} />
        <Route exact path='/Rider' element={<Rider/>} />
        <Route exact path='/Driver' element={<Driver/>} />
        <Route exact path='/DriverSignup' element={<DriverSignup/>} />
        <Route exact path='/ComponentTesting' element={<ComponentTesting/>} />
    </Routes>
  );
}

export default App;
