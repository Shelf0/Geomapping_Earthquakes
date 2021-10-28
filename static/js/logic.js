// Layer Variables
var earthquakes = new L.LayerGroup();
var tplates = new L.LayerGroup();

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var colors = ['#ADFF2F', '#9ACD32', '#FFFF00', '#ffd700', '#FFA500', '#FF0000']
var range = [-10, 10, 30, 50, 70, 90];

// function to change color by depth

function changeColor(d, earthquakeData) {
    for (var i = 0; i < range.length; i++) {
        if (d < range[i]) {
            return colors[i - 1];
        }
        else if (d > range[range.length - 1]) {
            return colors[range.length - 1];
        }
    }
}


// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    console.log(data.features);
    createFeatures(data.features);



    function createFeatures(earthquakeData) {

        earthquakes = L.geoJSON(earthquakeData, {
            pointToLayer: function (feature, location) {
                return L.circleMarker(location, {
                    radius: feature.properties.mag * 4,
                    fillColor: changeColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 1
                });

            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h3>" + feature.properties.place +
                    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
                    + "<p>" + "Magnitude: " + feature.properties.mag + "</p>"
                    + "<p>" + "Depth: " + feature.geometry.coordinates[2] + "</p>"

                )
            }
        })
        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes);
    }
})
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url2, function(tdata){
    L.geoJSON(tdata, {

    }).addTo(tplates)
    tplates.addTo(myMap)
})

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });


    var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Street Map": OpenStreetMap_Mapnik,
        "Light Map": OpenTopoMap,
        "Dark Map": CartoDB_DarkMatter
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        Tectonic: tplates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapie", {
        center: [
            35.09, -95.71
        ],
        zoom: 5,
        minZoom: 2.85,
        layers: [OpenStreetMap_Mapnik, earthquakes, OpenTopoMap]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = range;

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + changeColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}