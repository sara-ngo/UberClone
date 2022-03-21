import React, { useRef, useEffect, useState }  from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '../styles/Map.css';
import 'mapbox-gl/dist/mapbox-gl.css'; // for zoom and navigation control
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  var [lng, setLng] = useState(-121.881073);
  var [lat, setLat] = useState(37.335186);
  const [zoom, setZoom] = useState(12);
  
  // starting point
  const start = [lng, lat];
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  });

  // render the map after the side load
  useEffect(() => {
    if (map.current) return; // initialize map only once

    // let lat = geolocationCoordinatesInstance.latitude;
    // let lng = geolocationCoordinatesInstance.longitude;
    // console.log("LAT =" + lat);
    // console.log("LONG =" + lng);
    
    // navigator.geolocation.getCurrentPosition(function(position) {
    //     console.log("Latitude is :", position.coords.latitude);
    //     console.log("Longitude is :", position.coords.longitude);
    // });


    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      //starting point is center of the map
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    addGeoCoder();
    route();
    zoomControl();
  }, [map.current]);

  const zoomControl = () => {
    map.current.addControl(
      new mapboxgl.NavigationControl(), "top-left"
    );
  }

  const addGeoCoder = () => {
    map.current.addControl(geocoder);
  }

  // get real time location
  const locate = () => {
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        style: {
          right: 10,
          top: 10
        },
        position: 'bottom-left',
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
      })
    );
  }

  const route = () => {
    locate();
    map.current.on('load', () => {
      // make an initial directions request that
      // starts and ends at the same location
      // getRoute(start);
        
      // Add starting point to the map
      map.current.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: start
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be'
        }
      });

      map.current.on('click', (event) => {
        const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
        const end = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coords
              }
            }
          ]
        };
        if (map.current.getLayer('end')) {
          map.current.getSource('end').setData(end);
        } else {
          map.current.addLayer({
            id: 'end',
            type: 'circle',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'Point',
                      coordinates: coords
                    }
                  }
                ]
              }
            },
            paint: {
              'circle-radius': 10,
              'circle-color': '#f30'
            }
          });
        }
        getRoute(coords);
      });
    });
  }


  async function getRoute(end) {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.current.getSource('route')) {
      map.current.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    // get the sidebar and add the instructions
    const instructions = document.getElementById('instructions');
    const steps = data.legs[0].steps;

    let tripInstructions = '';
    for (const step of steps) {
      tripInstructions += `<li>${step.maneuver.instruction}</li>`;
    }
    instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
      data.duration / 60
    )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
  }

  return (
    <>
      <div ref={mapContainer} className="map-container" />
      <div id="instructions" className="instructions"></div>
    </>
  );
};

export default Map;