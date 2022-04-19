import React from "react"
import { Link } from "react-router-dom"
import "../../styles/Navbar.css"

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

// https://getbootstrap.com/docs/4.0/components/navbar/
function Navbar() {
  return (
    <div className="container mb-1">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">
          <strong>UBER</strong>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
          <li className="nav-item active">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item active">
              <Link to="/profile" className="nav-link">
                Profile
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
            <li className="nav-item active">
              <Link to="/DriverSignup" className="nav-link">
                Become a Driver?
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
export default Navbar;