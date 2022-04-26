import mapboxgl from 'mapbox-gl';
import '../../styles/calculateCost.css';

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
    
    // check if price meets minimum wages
    const checkPrice = (price, minutes) => {
      if (price <= MINIMUM_FARE && minutes <= 0.5) {
        price = MINIMUM_FARE;
        return price;
      } else {
        return price;
      }
    }

    const costEst = document.getElementById('costEst');

    var tripDuration = Math.floor(data.duration / 60);
    var tripDistance = Math.floor(data.distance / 1000);

    var tripCost = tripDuration*TIME_FEE + tripDistance*RIDE_DISTANCE + BASE_FEE + BOOKING_FEE;
    tripCost = parseInt(checkPrice(tripCost, tripDuration));
    
    var comfortCost = (tripCost + COMFORT_FEE)*COMFORT_RATE;
    var poolCost = tripCost/2 + POOL_FEE;

    costEst.innerHTML =
    `<div>
        <p id="title">Trip duration: ${tripDuration} minutes</p>
        <p id="title">Trip distance: ${tripDistance} miles</p>
        <p id="title">Estimated cost: </p>
        <ul id="chooseRide"> 
          <li value="uberX">
            <p>UberX: $${tripCost.toFixed(2)}</p>
          </li>
          <li value="comfort">
            <p >Comfort: $${comfortCost.toFixed(2)}</p>
            <p id="caption">Newer cars with extra legroom</p>
          </li>
          <li value="pool">
            <p>Pool: $${poolCost.toFixed(2)}</p>
            <p id="caption">Share the ride with 1 to 3 people</p>
          </li>
        </ul>
    </div>`;
  }


export default calculateCost;
