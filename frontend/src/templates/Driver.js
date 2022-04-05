import React from 'react'
import '../styles/App.css'
import Map from '../components/Map/Map'
import Navbar from '../components/Navbar/Navbar'

function Driver() {
  return (
    <>
    <Navbar />
    <r-c join>
        <main data-md2-3 class="main-content">
            <Map text='driver'/>
        </main>
        <aside data-md1-3 data-md1 class="left-sidebar">
            <h2>Left Sidebar</h2>
            <p>You can put side navigation here or aside content.</p>
        </aside>
    </r-c>
    <footer data-r-c data-join class="footer">
        <c1-1>
            <ul class="menu-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
            </ul>
            <p><small>Made with <a href="https://matthewjamestaylor.com/responsive-columns" target="_blank" rel="noopener">Responsive Columns</a>.</small></p>
        </c1-1>
    </footer>
    </>
  );
}

export default Driver;
