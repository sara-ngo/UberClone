import React, {Component} from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "../../styles/Map.css";
import "mapbox-gl/dist/mapbox-gl.css"; // for zoom and navigation control
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import getRoute from "./Navigation";
import TripService from "../TripService/emitter";
//import loadRiderLocation from "./loadRiderLocation";
//import loadDriverLocation from "./loadDriverLocation";

import driverIcon from './driverIcon.png';
import riderIcon from './riderIcon.png';
import routeEndIcon from './routeEndIcon.png';

const ACCESS_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";
mapboxgl.accessToken = ACCESS_TOKEN;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class App extends Component {

  constructor(props) {
    super(props);

    this.mapboxObj = {};
    this.mapContainerRef = React.createRef();
    this.userLong = 0.0;
    this.userLat = 0.0;
    this.userHeading = 0.0;
    this.userType = props.userType;
    this.viewLongInit = -121.9098;
    this.viewLatInit = 37.3413;
    this.viewZoomInit = 10.02;
    this.viewLong = 0.0;
    this.viewLat = 0.0;
    this.viewZoom = 12;
    this.routeStartLong = 0.0;
    this.routeStartLat = 0.0;
    this.routeEndLong = 0.0;
    this.routeEndLat = 0.0;
    this.locationMap = new Map();
    this.mapLoadedFlag = false;
    this.abort = false;

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

  refreshMarkers = (mapObj) => {
    let driverFeatureArray = [];
    let riderFeatureArray = [];
    let timeThreshold = Date.now() - 20000;
    for (let [socketId, userObjRef] of this.locationMap) {
      if (userObjRef.timestamp < timeThreshold) {
        this.locationMap.delete(socketId);
        continue;
      }
      // set heading to 0 (north) if not set
      // old server version did not have heading
      if(!userObjRef.heading){
        userObjRef.heading = 0;
      }
      if (userObjRef.type == "driver") {
        driverFeatureArray.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [userObjRef.long, userObjRef.lat]
          },
          properties: {
            title: userObjRef.socketId,
            "rotate": userObjRef.heading
          }
        });
      } else if (userObjRef.type == "rider") {
        riderFeatureArray.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [userObjRef.long, userObjRef.lat]
          },
          properties: {
            title: userObjRef.socketId,
            "rotate": userObjRef.heading
          }
        });
      }
    }
    let driverFeatures = {
      type: "FeatureCollection",
      features: driverFeatureArray
    };
    let riderFeatures = {
      type: "FeatureCollection",
      features: riderFeatureArray
    };
    this.mapboxObj.getSource("driverPoints").setData(driverFeatures);
    this.mapboxObj.getSource("riderPoints").setData(riderFeatures);
  };

  async positionUpdateLoop() {
    while (this.abort === false) {
      this.refreshMarkers(this.mapboxObj);
      await sleep(200);
    }
  }

  mapLoaded = () => {
    // Load an image from an external URL.
    this.mapboxObj.loadImage(driverIcon, (error, image) => {
      if (error)
        throw error;

      // Add the image to the map style.
      this.mapboxObj.addImage('driverIcon', image);
    });

    this.mapboxObj.loadImage(riderIcon, (error, image) => {
      if (error)
        throw error;

      // Add the image to the map style.
      this.mapboxObj.addImage('riderIcon', image);
    });

    this.mapboxObj.loadImage(routeEndIcon, (error, image) => {
      if (error)
        throw error;

      // Add the image to the map style.
      this.mapboxObj.addImage('routeEndIcon', image);
    });

    // Add driver symbol layer
    this.mapboxObj.addLayer({
      id: "driverPoints",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      'layout': {
        'icon-image': 'driverIcon', // reference the image
        'icon-size': 0.05,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        "icon-rotate": ["get", "rotate"]
      }
    });

    // Add rider symbol layer
    this.mapboxObj.addLayer({
      id: "riderPoints",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      'layout': {
        'icon-image': 'riderIcon', // reference the image
        'icon-size': 0.3,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        "icon-rotate": ["get", "rotate"]
      }
    });

    // Add route starting point to the map
    this.mapboxObj.addLayer({
      id: "routeStartPoint",
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be"
      }
    });

    // Add route ending point to the map
    this.mapboxObj.addLayer({
      id: "routeEndPoint",
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

    TripService.on("positionData", this.onPositionData);
    TripService.on("setRoute", this.setRoute);
    this.mapboxObj.on("click", this.onClick);

    // centers the map on your current location
    this.geolocate.trigger();
    this.mapLoaded = true;

    // begin loop
    this.positionUpdateLoop();
  }

  onPositionData = (data) => {
    //console.log("Position Data Received:");
    //console.log(data);
    /*
    Example:
    {
      lat: 37.34293857374593,
      long: -121.96381019791124,
      socketId: "3eXdAmTYVU8PVZ4rAAAZ",
      timestamp: 1651802163469,
      token: 0,
      type: "driver"
    }
    */
    this.locationMap.set(data.socketId, data);
  };

  onClick = (event) => {
    // drivers do not set the route
    if (this.userType == "driver") {
      return;
    }
    // console.log(event);
    this.getDestination({"routeEndLong": event.lngLat.lng, "routeEndLat": event.lngLat.lat});
  }

  /* MapboxGeocoder
Fired when input is set */
  onGeocoderResult = (e) => {
    //console.log(e);
    if (!e) {
      return;
    }
    // drivers do not set the route
    if (this.userType == "driver") {
      return;
    }
    // set variables
    this.getDestination({"routeEndLong": e.result.center[0], "routeEndLat": e.result.center[1]});
  }

  getDestination = (data) => {
    // set variables
    this.routeEndLong = data.routeEndLong;
    this.routeEndLat = data.routeEndLat;
    // emit for other components to use
    TripService.emit("destinationSelected", {
      "routeStartLong": this.routeStartLong,
      "routeStartLat": this.routeStartLat,
      "routeEndLong": this.routeEndLong,
      "routeEndLat": this.routeEndLat
    });
  }

  setRoute = (data) => {
    // update UI with end position marker
    const endFeatures = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [data.routeEndLong, data.routeEndLat]
          }
        }
      ]
    };
    this.mapboxObj.getSource("routeEndPoint").setData(endFeatures);
    // get route information from API
    let returnStatus = getRoute(this.mapboxObj, {
      "routeId": data.routeId,
      "startLong": data.startLong,
      "startLat": data.startLat,
      "endLong": data.endLong,
      "endLat": data.endLat
    });
    return returnStatus;
  }

  onGeolocate = (position) => {
    //console.log("onGeolocate");
    //console.log(position);
    // set class member variables
    this.userLong = position.coords.longitude;
    this.userLat = position.coords.latitude;
    this.userHeading = position.coords.heading;
    this.routeStartLong = this.userLong;
    this.routeStartLat = this.userLat;
    // emit user location
    let positionData = {};
    positionData.long = position.coords.longitude;
    positionData.lat = position.coords.latitude;
    positionData.heading = position.coords.heading;
    TripService.emit("onGeolocatePositionUpdate", positionData);
  }

  onMapMove = (data) => {
    this.viewLong = this.mapboxObj.getCenter().lng.toFixed(4);
    this.viewLat = this.mapboxObj.getCenter().lat.toFixed(4);
    this.viewZoom = this.mapboxObj.getZoom().toFixed(2);
    //console.log(this.viewLong,this.viewLat,this.viewZoom);
  }

  /* BRAD: I have no idea when this triggers
   */
  onLocationFound = (e) => {
    console.log("locationfound, " + e.latlng.lng + ", " + e.latlng.lat);
  }

  componentDidMount = () => {
    this.mapboxObj = new mapboxgl.Map({
      "container": this.mapContainerRef.current, "style": "mapbox://styles/mapbox/streets-v11",
      //starting point is center of the map
      "center": [
        this.viewLongInit, this.viewLatInit
      ],
      "zoom": this.viewZoomInit
    });

    // search address box + marker
    this.geocoder = new MapboxGeocoder({
      "accessToken": mapboxgl.accessToken,
      "marker": {
        "color": "blue"
      },
      "mapboxgl": mapboxgl
    });

    // get user's real time location
    this.geolocate = new mapboxgl.GeolocateControl({
      "positionOptions": {
        "enableHighAccuracy": true
      },
      // When active the map will receive updates to the device's location as it changes.
      "trackUserLocation": true,
      "style": {
        "right": 10,
        "top": 10
      },
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      "showUserHeading": true
    });

    // get user input
    this.mapboxObj.addControl(this.geocoder);
    this.mapboxObj.addControl(new mapboxgl.NavigationControl(), "top-left");
    //get current location
    this.mapboxObj.addControl(this.geolocate, "top-right");

    // subscriptions
    this.mapboxObj.on("load", this.mapLoaded);
    this.mapboxObj.on("move", this.onMapMove);
    this.mapboxObj.on("locationfound", this.onLocationFound);
    this.geolocate.on("geolocate", this.onGeolocate);
    this.geocoder.on('result', this.onGeocoderResult);
  };

  componentWillUnmount = () => {
    this.abort = true;
    this.mapboxObj.off("load", this.mapLoaded);
    this.mapboxObj.off("move", this.onMapMove);
    this.mapboxObj.off("locationfound", this.onLocationFound);
    this.geolocate.off("geolocate", this.onGeolocate);
    this.geocoder.off('result', this.onGeocoderResult);
    if (this.mapLoadedFlag) {
      TripService.off("positionData", this.onPositionData);
      TripService.off("setRoute", this.setRoute);
      this.mapboxObj.off("click", this.onClick);
    }
  }

  render = () => {
    return (<> < div ref = {
      this.mapContainerRef
    }
    className = "map-container" /> </>);
  }
};

export default App;
