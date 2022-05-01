import mapboxgl from "mapbox-gl";
import TripService from '../TripService/emitter';

/*
Brad: calculateCost and getRoute have been merged
They pretty much did the same thing to begin with
*/
async function getRoute(end, start, map) {
  const query = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`, {method: "GET"});
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route
    }
  };
  // if the route already exists on the map, we'll reset it using setData
  if (map.current.getSource("route")) {
    map.current.getSource("route").setData(geojson);
  } else {
    // otherwise, we'll make a new request
    map.current.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geojson
      },
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0.75
      }
    });

  }

  /* Brad: Basically I transferred all the logic for selection and displaying
  Estimated cost into the CostEstimation component:
  components/CostEstimation/CostEstimation */
  TripService.emit("tripEstimateData", {
    "data": data
  });
}

export default getRoute;
