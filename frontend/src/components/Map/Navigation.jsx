import mapboxgl from "mapbox-gl";
import TripService from '../TripService/emitter';

let routeMap = new Map();
/* Brad: calculateCost and getRoute have been merged
They pretty much did the same thing to begin with */
async function setRoute(mapboxObj, data) {
  if (!data.routeId) {
    return false;
  }
  const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${data.startLong},${data.startLat};${data.endLong},${data.endLat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`, {method: "GET"});
  const json = await response.json();
  if (!json.routes) {
    return false;
  }
  if (json.routes.length == 0) {
    return false;
  }
  const directionData = json.routes[0];
  // routeGeometry appears to be an array(N) of array(2) [long, lat]
  const routeGeometry = directionData.geometry.coordinates;
  //console.log("routeGeometry");
  //console.log(routeGeometry);
  //console.log("json");
  //console.log(json);
  // set map
  routeMap.set(data.routeId, data);
  let routeObjRef = routeMap.get(data.routeId);
  routeObjRef.routeId = data.routeId;
  routeObjRef.startLat = data.startLat;
  routeObjRef.startLong = data.startLong;
  routeObjRef.endLat = data.endLat;
  routeObjRef.endLong = data.endLong;
  routeObjRef.distance = directionData.distance;
  routeObjRef.duration = directionData.duration;
  routeObjRef.routeGeometry = routeGeometry;
  routeObjRef.steps = directionData.steps;
  // set layer names
  routeObjRef.startLayer = "routeStart-" + data.routeId;
  routeObjRef.endLayer = "routeEnd-" + data.routeId;
  routeObjRef.pathLayer = "routePath-" + data.routeId;
  // start marker
  let startLayerSource = mapboxObj.getSource(routeObjRef.startLayer);
  if (!startLayerSource) {
    mapboxObj.addLayer({
      id: routeObjRef.startLayer,
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      paint: {
        "circle-radius": 5,
        "circle-color": "#3887be"
      }
    });
    startLayerSource = mapboxObj.getSource(routeObjRef.startLayer);
  }
  const startFeatures = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [data.startLong, data.startLat]
        }
      }
    ]
  };
  startLayerSource.setData(startFeatures);
  // end marker
  let endLayerSource = mapboxObj.getSource(routeObjRef.endLayer);
  if (!endLayerSource) {
    mapboxObj.addLayer({
      id: routeObjRef.endLayer,
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      'layout': {
        'icon-image': 'routeEndIcon', // reference the image
        'icon-size': 0.6,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
    endLayerSource = mapboxObj.getSource(routeObjRef.endLayer);
  }
  const endFeatures = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [data.endLong, data.endLat]
        }
      }
    ]
  };
  endLayerSource.setData(endFeatures);
  // display the path
  let pathLayerSource = mapboxObj.getSource(routeObjRef.pathLayer);
  if (!pathLayerSource) {
    mapboxObj.addLayer({
      id: routeObjRef.pathLayer,
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
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
    pathLayerSource = mapboxObj.getSource(routeObjRef.pathLayer);
  }
  const pathFeatures = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeGeometry
        }
      }
    ]
  };
  pathLayerSource.setData(pathFeatures);
  TripService.emit("mapNewRoute", routeObjRef);
  /* Brad: Basically I transferred all the logic for selection and displaying
  Estimated cost into the CostEstimation component:
  components/CostEstimation/CostEstimation */
  TripService.emit("tripEstimateData", {"data": directionData});
  return true;
}

export default setRoute;
