import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";


// https://getbootstrap.com/docs/4.0/components/navbar/
function Navbar() {
  return (
    <div class="container mb-1">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a class="navbar-brand" href="#">
          <strong>UBER</strong>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent-7"
          aria-controls="navbarSupportedContent-7"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent-7">
          <ul class="nav">
            <li className="nav-item ">
              <Link to="/" className="nav-link active">
                Home
              </Link>
            </li>
            <li className="nav-item ">
              <Link to="/Rider" className="nav-link active">
                Rider
              </Link>
            </li>
            <li className="nav-item ">
              <Link to="/Driver" className="nav-link active">
                Driver
              </Link>
            </li>
            <li className="nav-item ">
              <Link to="/Login" className="nav-link active">
                Log In
              </Link>
            </li>
            <li className="nav-item ">
              <Link to="/Signup" className="nav-link active">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
