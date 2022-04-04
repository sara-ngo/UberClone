import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

// https://getbootstrap.com/docs/4.0/components/navbar/
function Navbar() {
  return (
    <div class="container mb-1">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">
          <strong>UBER</strong>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li className="nav-item active">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item active">
              <Link to="/Rider" className="nav-link">
                Rider
              </Link>
            </li>
            <li className="nav-item active">
              <Link to="/Driver" className="nav-link">
                Driver
              </Link>
            </li>
            <li className="nav-item active">
              <Link to="/Login" className="nav-link">
                  Login
              </Link>
            </li>
            <li className="nav-item active">
              <Link to="/Signup" className="nav-link">
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
