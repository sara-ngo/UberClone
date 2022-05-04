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

const ACCESS_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";
mapboxgl.accessToken = ACCESS_TOKEN;

class App extends Component {

  constructor(props) {
    super(props);

    this.mapboxObj = {};
    this.mapContainerRef = React.createRef();
    this.userLong = 0.0;
    this.userLat = 0.0;
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

    this.state = {
      "className": "RequestRideButtonDisabled",
      "buttonText": "Request (First Select Ride Type)"
    }
  }

  refreshMarkers = (mapObj) => {
    let driverFeatureArray = [];
    let riderFeatureArray = [];
    for (let [key, value] of this.locationMap) {
      if (value.type == "driver") {
        driverFeatureArray.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [value.long, value.lat]
          },
          properties: {
            title: value.socketId
          }
        });
      } else if (value.type == "rider") {
        riderFeatureArray.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [value.long, value.lat]
          },
          properties: {
            title: value.socketId
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

  mapLoaded = () => {
    // Add driver symbol layer
    this.mapboxObj.addLayer({
      id: "driverPoints",
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [0, 0]
              }
            }
          ]
        }
      },
      paint: {
        "circle-radius": 10,
        "circle-color": "#0000ff"
      }
    });

    // Add rider symbol layer
    this.mapboxObj.addLayer({
      id: "riderPoints",
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [0, 0]
              }
            }
          ]
        }
      },
      paint: {
        "circle-radius": 5,
        "circle-color": "#f08"
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
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [0, 0]
              }
            }
          ]
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
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [0, 0]
              }
            }
          ]
        }
      },
      paint: {
        "circle-radius": 10,
        "circle-color": "#f30"
      }
    });

    TripService.on("positionData", this.onPositionData);
    TripService.on("setDestination", this.setDestination);
    this.mapboxObj.on("click", this.onClick);

    // centers the map on your current location
    this.geolocate.trigger();
    this.mapLoaded = true;
  }

  onPositionData = (data) => {
    //console.log("Position Data Received:");
    //console.log(data);
    this.locationMap.set(data.socketId, data);
    this.refreshMarkers(this.mapboxObj);
  };

  onClick = (event) => {
    // drivers to not set the route
    if (this.userType == "driver") {
      return;
    }
    // console.log(event);
    this.setDestination({"routeEndLong": event.lngLat.lng, "routeEndLat": event.lngLat.lat});
  }

  /* MapboxGeocoder
Fired when input is set */
  onGeocoderResult = (e) => {
    //console.log(e);
    if (!e) {
      return;
    }
    // drivers to not set the route
    if (this.userType == "driver") {
      return;
    }
    // set variables
    this.setDestination({"routeEndLong": e.result.center[0], "routeEndLat": e.result.center[1]});
  }

  setDestination = (data) => {
    // set variables
    this.routeEndLong = data.routeEndLong;
    this.routeEndLat = data.routeEndLat;
    // update UI with end position marker
    const endFeatures = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [this.routeEndLong, this.routeEndLat]
          }
        }
      ]
    };
    this.mapboxObj.getSource("routeEndPoint").setData(endFeatures);
    // get route information from API
    let returnStatus = getRoute(this.mapboxObj, {
      "routeStartLong": this.routeStartLong,
      "routeStartLat": this.routeStartLat,
      "routeEndLong": this.routeEndLong,
      "routeEndLat": this.routeEndLat
    });
    // emit for other components to use
    TripService.emit("destinationSelected", {
      "routeStartLong": this.routeStartLong,
      "routeStartLat": this.routeStartLat,
      "routeEndLong": this.routeEndLong,
      "routeEndLat": this.routeEndLat
    });
  }

  onGeolocate = (position) => {
    // set class member variables
    this.userLong = position.coords.longitude;
    this.userLat = position.coords.latitude;
    this.routeStartLong = this.userLong;
    this.routeStartLat = this.userLat;
    //
    let positionData = {};
    positionData.long = position.coords.longitude;
    positionData.lat = position.coords.latitude;
    if (this.userType === "driver") {
      positionData.type = "driver";
    } else {
      positionData.type = "rider";
    }
    TripService.emit("positionUpdate", positionData);
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
    this.mapboxObj.off("load", this.mapLoaded);
    this.mapboxObj.off("move", this.onMapMove);
    this.mapboxObj.off("locationfound", this.onLocationFound);
    this.geolocate.off("geolocate", this.onGeolocate);
    this.geocoder.off('result', this.onGeocoderResult);
    if (this.mapLoadedFlag) {
      TripService.off("positionData", this.onPositionData);
      TripService.off("setDestination", this.setDestination);
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
