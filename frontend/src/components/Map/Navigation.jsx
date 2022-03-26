import mapboxgl from 'mapbox-gl';

var instructionEles = [];

async function getRoute(end, start, map) {
  console.log("getRoute");
  const query = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`, {method: 'GET'});
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
  } else {
    // otherwise, we'll make a new request
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
  var list = document.getElementsByName("instructions");
  for (var item of list) {
    console.log(item)
  }
  const steps = data.legs[0].steps;

  let tripInstructions = '';
  for (const step of steps) {
    tripInstructions += `<li>${step.maneuver.instruction}</li>`;
  }
  // update any element with name=instructions
  for (var item of list) {
    item.innerHTML = `<p><strong>Trip duration: ${Math.floor(data.duration / 60)} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
  }
}

function MapNavigation(props) {
  return <> < div name = "instructions"
  className = "instructions" > < /div>
</ >;
}

export {
  MapNavigation,
  getRoute
};
