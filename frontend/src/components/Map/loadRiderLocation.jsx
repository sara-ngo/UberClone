async function loadRiderLocation(map) {
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
            coordinates: [-121.888138, 37.334789],
          },
          properties: {
            title: "Rider1",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.93034, 37.33171],
          },
          properties: {
            title: "Rider2",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.899117, 37.413738],
          },
          properties: {
            title: "Rider3",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.925567, 37.362517],
          },
          properties: {
            title: "Rider4",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-121.927011, 37.313938],
          },
          properties: {
            title: "Rider5",
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
      "circle-color": "#f08",
    },
  });
}

export default loadRiderLocation;
