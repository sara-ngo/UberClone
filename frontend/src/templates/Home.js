import React from 'react';
import '../styles/App.css';

import Navbar from '../components/Navbar';

function Home() {
  return (
    <>
      <Navbar />
      <div>
          <p>Homepage - from Home.js</p>
      </div>
    </>
  );
}

export default Home;