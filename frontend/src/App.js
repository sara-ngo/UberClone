import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'

import Home from './templates/Home'
import Rider from './templates/Rider'

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/Rider' element={<Rider/>} />
      </Routes>
    </Router>
  );
}

export default App;
