// Store our USGS Earthquake API endpoint inside quakeUrl
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Store our Tectonic Plate API endpoint inside platesUrl
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";


// Perform a GET request to the quake URL
d3.json(quakeUrl, function(data) {
  // Store earthquake JSON response object into variable
  let earthquakeData = data.features
  // Perfom a GET request to the plates URL inside other d3.json so both objects within scope
  d3.json(platesUrl, function(data) {
    // Store plate tectonic JSON response object into variable
    let platesData = data.features

    // Call createMap function and pass both JSON response objects
    createMap(earthquakeData,platesData)
  })
})

// Function to Create Map 
function createMap(earthquakeData,platesData) {

    // Create Markers for each earthquakeData feature
    let earthquakeMarkers = earthquakeData.map((feature) =>
      // Make circleMarker and bind Popup for each earthquakeData feature
      L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],{
          radius: magCheck(feature.properties.mag),  // Call magCheck function to eliminate values <= 0 and scale
          stroke: true,
          color: 'black',
          opacity: 1,
          weight: 0.5,
          fill: true,
          fillColor: magColor(feature.properties.mag),  // Call magColor function to color marker according to magnitude
          fillOpacity: 0.9   
      })
      .bindPopup("<h1> Magnitude : " + feature.properties.mag +
      "</h1><hr><h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
    )

    // Create layerGroup for earthquakeMarkers
    let earthquakes = L.layerGroup(earthquakeMarkers);


    function makePolyline(feature, layer){
      L.polyline(feature.geometry.coordinates);
    }
    
    let plates = L.geoJSON(platesData, {
      onEachFeature: makePolyline,
        style: {
          color: 'red',
          opacity: 0.9
        }
    })

  
  // Define streetmap, darkmap, satellite and outdoors layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellite =  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoors =  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellite,
    "Outdoors Map": outdoors
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates : plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

// Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(myMap){
    var div = L.DomUtil.create("div","legend");
    div.innerHTML = [
        "<k class='maglt2'></k><span>0-2</span><br>",
        "<k class='maglt3'></k><span>2-3</span><br>",
        "<k class='maglt4'></k><span>3-4</span><br>",
        "<k class='maglt5'></k><span>4-5</span><br>",
        "<k class='maggt5'></k><span>5+</span><br>"
      ].join("");
    return div;
}

legend.addTo(myMap);
  //Create a layer control
  //Pass in our baseMaps and overlayMaps
  //Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}


     function magColor(mag) {
      var color = "";
      if (mag <= 2) { color = "#ffffb2"; }
      else if (mag <= 3) {color = "#fecc5c"; }
      else if (mag <= 4) { color = "#fd8d3c"; }
      else if (mag <= 5) {color = "#f03b20"; }
      else { color = "#bd0026"; }
    
    return color;
    
    };
// Function to determine if the magnitude is zero or less 
function magCheck(mag){
  if (mag <= 1){
      return 6
  }
  return mag * 6;
}
