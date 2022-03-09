// const React = require('react')
// const { useRef, useEffect, useState } = require('react')

// const mapboxgl = require('!mapbox-gl')
// mapboxgl.accessToken = 'pk.eyJ1IjoiYWxhbmNvZGV0ZXN0IiwiYSI6ImNsMGluMDFhMDA0OWUzZG1nb2EzMTB2NmkifQ.6jLKuMQ6gxyGBgheDWPQwA'
// //mapboxg1.style = 'mapbox://styles/mapbox/satellite-v9'
// require('mapbox-gl/dist/mapbox-gl.css');
// require('./index.css');

// const Map = function () {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(-70.9);
//   const [lat, setLat] = useState(42.35);
//   const [zoom, setZoom] = useState(9);
//   useEffect(() => {
//     if (map.current) return; // initialize map only once
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       height: 1000,
//       width: 1000,
//       style: 'mapbox://styles/mapbox/dark-v10',
//       center: [lng, lat],
//       zoom: zoom
//     });
//   });
//   return (
//     <div>
//       <div ref={mapContainer} className="map-container" />
//     </div>
//   );
// }

// module.exports = Map

const React = require('react');
const { useRef, useEffect, useState } = require('react');
const mapboxgl = require ('mapbox-gl');
// require('./index.css');

mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const Map = () => {
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(1.5);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

module.exports = Map;
