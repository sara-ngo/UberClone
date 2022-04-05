import mapboxgl from 'mapbox-gl';

const BASE_FEE = 0.9;

async function calculateRoute(end, start, map) {
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
    const costEst = document.getElementById('costEst');

    var tripDuration = Math.floor(data.duration / 60);
    var baseFare = tripDuration * BASE_FEE;


    costEst.innerHTML =
    `<div>
        <p><strong>Trip duration: ${tripDuration} minutes</strong></p>
        <p><strong>Estimated cost: $${baseFare} </strong></p>
    </div>`;
  }


export default calculateRoute;
