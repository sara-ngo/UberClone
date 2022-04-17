import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "../../styles/Map.css";
import "mapbox-gl/dist/mapbox-gl.css"; // for zoom and navigation control
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import calculateRoute from "./calculateRoute";
import getRoute from "./Navigation";
import TripService from "../TripService/emitter";
import loadRiderLocation from "./loadRiderLocation";
import loadDriverLocation from "./loadDriverLocation";

const ACCESS_TOKEN =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";
mapboxgl.accessToken = ACCESS_TOKEN;

var start = [-122.405818, 37.802374];

const Map = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.405818);
  const [lat, setLat] = useState(37.802374);
  const [zoom, setZoom] = useState(12);

  // search address box + marker
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: {
      color: "blue",
    },
    mapboxgl: mapboxgl,
  });
  const addGeoCoder = () => {
    map.current.addControl(geocoder);
  };

  // zoom controller
  const zoomControl = () => {
    map.current.addControl(new mapboxgl.NavigationControl(), "top-left");
  };

  // get user's real time location
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    style: {
      right: 10,
      top: 10,
    },
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  });
  const addGeolocate = () => {
    map.current.addControl(geolocate, "top-right");
  };

  useEffect(() => {
    geolocate.on("geolocate", function (position) {
      setLng(position.coords.longitude);
      setLat(position.coords.latitude);
      start = [position.coords.longitude, position.coords.latitude];
      var positionData = {};
      positionData.long = position.coords.longitude;
      positionData.lat = position.coords.latitude;
      if (props.text === "driver") {
        positionData.type = "driver";
      } else {
        positionData.type = "rider";
      }
      TripService.emit("positionUpdate", positionData);
    });
  });

  // get direction
  const route = () => {
    map.current.on("load", () => {
      // make an initial directions request that
      // starts and ends at the same location
      // getRoute(start);

      // Add starting point to the map
      map.current.addLayer({
        id: "point",
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
                  coordinates: start,
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "#3887be",
        },
      });

      map.current.on("click", (event) => {
        const coords = Object.keys(event.lngLat).map(
          (key) => event.lngLat[key]
        );
        const end = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: coords,
              },
            },
          ],
        };
        if (map.current.getLayer("end")) {
          map.current.getSource("end").setData(end);
        } else {
          map.current.addLayer({
            id: "end",
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
                      coordinates: coords,
                    },
                  },
                ],
              },
            },
            paint: {
              "circle-radius": 10,
              "circle-color": "#f30",
            },
          });
        }
        calculateRoute(coords, start, map);
        getRoute(coords, start, map);
      });
    });
  };

  // render the map after the side load
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      //starting point is center of the map
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    /* Once we've got a position, zoom and center the map on it
     */
    map.current.on("locationfound", function (e) {
      //map.fitBounds(e.bounds);
      console.log("locationfound, " + e.latlng.lng + ", " + e.latlng.lat);
    });

    map.current.on("load", function () {
      geolocate.trigger();
    });

    zoomControl();
    addGeoCoder(); // get user input
    addGeolocate(); //get current location
    route(); // generate route

    map.current.on("load", function () {
      if (props.text === "driver") {
        loadRiderLocation(map);
      } else {
        loadDriverLocation(map);
      }
    });
   

    TripService.on("positionData", (data) => {
      console.log("Position Data Received:");
      console.log(data);
    });
  });

  return (
    <>
      <div ref={mapContainer} className="map-container" />
      <div>
        {" "}
        {(() => {
          if (props.text === "rider") {
            //return (
            //   <div id="costEst" className="costEst"></div>
            //)
          } else if (props.text === "driver") {
            //return (
            //  <div id="instructions" className="instructions"></div>
            //)
          } else {
            return <div>catch all </div>;
          }
        })()}{" "}
      </div>{" "}
    </>
  );
};

export default Map;


