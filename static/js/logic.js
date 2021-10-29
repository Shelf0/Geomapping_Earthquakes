// Colors of markers
var myColors = ['#ecffb3', '#99cc00', '#ffcc00', ' #ff9900', '#cc0000', '#33001a'];

// Store the API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function markerSize(mag) {
    return (mag) * 5;
  }

  function marker(feature, latlng) {
    var col;
    var colFill;
    var dep = feature.geometry.coordinates[2];
    if (dep < 10) {
      colFill = myColors[0]
    }
    else if (dep < 30) {
      colFill = myColors[1]
    }
    else if (dep < 50) {
      colFill = myColors[2]
    }
    else if (dep < 70) {
      colFill = myColors[3]
    }
    else if (dep < 90) {
      colFill = myColors[4]
    }
    else {
      colFill = myColors[5]
    }
    return new L.CircleMarker(latlng, {
      fillOpacity: 0.75,
      color: '#555',
      weight: 1,
      fillColor: colFill,

      radius: markerSize(feature.properties.mag)
    });
  }


  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<br>Magnitude: ${(feature.properties.mag)}
    </p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: marker
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}


function createMap(earthquakes) {

  //Create the base layers
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [topo, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: ' + myColors[0] + '"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[1] + '"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[2] + '"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[3] + '"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[4] + '"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[5] + '"></i><span>&gt;90</span><br>';
    return div;
  };

  legend.addTo(myMap);
}