async function loadDriverLocation(map) {
    console.log("load other location");
  
    // Add a GeoJSON source with 2 points
    map.current.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-121.904626, 37.293447],
            },
            properties: {
              title: "Driver1",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-121.861966, 37.315431],
            },
            properties: {
              title: "Driver2",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-121.842453, 37.339592],
            },
            properties: {
              title: "Driver3",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-121.889225, 37.391607],
            },
            properties: {
              title: "Driver4",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-121.825282, 37.34996],
            },
            properties: {
              title: "Driver5",
            },
          },
        ],
      },
    });
  
    // Add a symbol layer
    map.current.addLayer({
      id: "points",
      type: "circle",
      source: "points",
      paint: {
        "circle-radius": 10,
        "circle-color": "#0000ff",
      },
    });
  }
  
  export default loadDriverLocation;
  