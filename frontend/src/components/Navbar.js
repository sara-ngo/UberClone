import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
    return (
        <>
            <nav className='navbar'>
                <div className='navbar-container'>
                    <ul>
                        <li className='nav-item'>
                            <Link 
                                to='/' 
                                className='nav-links'>
                                Home
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/Rider'
                                className='nav-links'>
                                Rider
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/Driver'
                                className='nav-links'>
                                Driver
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/Login'
                                className='nav-links'>
                                Log In
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                to='/Signup'
                                className='nav-links'>
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Navbar;