import mapboxgl from 'mapbox-gl';
import '../../styles/calculateCost.css';
import TripService from '../TripService/emitter';

const BASE_FEE = 2.0;
const BOOKING_FEE = 2.50;
const TIME_FEE = 0.4;
const RIDE_DISTANCE = 0.5;
const MINIMUM_FARE = 16.0;
const COMFORT_FEE = 8.0;
const COMFORT_RATE = 1.35;
const POOL_FEE = 5.0;


async function calculateCost(end, start, map) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`, {
      method: 'GET'
    }
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

  // check if price meets minimum wages
  const checkPrice = (price) => {
    if (price <= MINIMUM_FARE) {
      price = MINIMUM_FARE;
      return price;
    } else {
      return price;
    }
  }

  var tripDuration = Math.floor(data.duration / 60);
  var tripDistance = Math.floor(data.distance / 1000);
  var tripCost = tripDuration * TIME_FEE + tripDistance * RIDE_DISTANCE + BASE_FEE + BOOKING_FEE;
  tripCost = parseInt(checkPrice(tripCost));

  var comfortCost = (tripCost + COMFORT_FEE) * COMFORT_RATE;
  var poolCost = tripCost / 2 + POOL_FEE;

  const costEst = document.getElementById('costEst');
  document.getElementById('tripDuration').innerHTML = `Trip duration: ${tripDuration} minutes`;
  document.getElementById('tripDistance').innerHTML = `Trip distance: ${tripDistance} miles`;
  document.getElementById('uberX').innerHTML = `UberX: $${tripCost.toFixed(2)}`;
  document.getElementById('comfort').innerHTML = `Comfort: $${comfortCost.toFixed(2)}`;
  document.getElementById('pool').innerHTML = `Pool: $${poolCost.toFixed(2)}`;
}


export default calculateCost;
