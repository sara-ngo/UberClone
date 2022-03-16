import React, { useRef, useEffect, useState }  from 'react';
import mapboxgl from 'mapbox-gl';
import '../styles/Map.css';
import 'mapbox-gl/dist/mapbox-gl.css'; // for zoom and navigation control

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const Map = () => {
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(-121.88);
  const [lat, setLat] = useState(37.33);
  const [zoom, setZoom] = useState(13);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl());

    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
      })
    );

    // Add navigator directions


    

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
      <div class="sidebar">
        <div class="heading">
          <h1>Routes</h1>
        </div>
        <div id="reports" class="reports"></div>
    </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
