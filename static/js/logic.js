var queryUrl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectUrl="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function getColor(mag) {
    var red = 255; 
    var green = 255;
    var stepSize = 6;
    if (mag >= 0 && mag <= 1) 
    {
        col="ff";
    }
    else if (mag > 1 && mag <= 2) 
        col="e9";
    else if (mag > 2 && mag <= 3)
        col="d5";
    else if (mag > 3 && mag <= 4) 
        col="99";
    else if (mag > 4 && mag <= 5)
        col="66";
     else 
        return "#ff0000"
    return "#ff"+col+"00"
}

var tect=function tect_data(){
    d3.json(tectUrl,function(data){
     console.log(data.features.geometry.coordinates);
     return data.features.geometry.coordinates
 })
}
d3.json(queryUrl,function(data){
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes=L.geoJson(earthquakeData, {
        pointToLayer: function(data, latlng) {
          return L.circleMarker(latlng, {
            radius: data.properties.mag * 6,
            color: getColor(data.properties.mag),
            opacity: 0.75,
            fillOpacity: 0.75,
            weight: 0
          }).bindPopup("<h3>" + data.properties.place +
          "</h3><hr><p>" + new Date(data.properties.time) + "</p>" + "<p>" +"Magnitude: "+data.properties.mag + "</p>");
        }
      });

    // // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
    
  }
  
  function createMap(earthquakes) {
  
    // Define streetmap and darkmap layers
    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoibWV0YWxpY2FydXMiLCJhIjoiY2thN2V1bDBxMDJ5bTJ4bGo1a29temsxNCJ9.5DGFqjLK2yLYd9Uab-EyrQ");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibWV0YWxpY2FydXMiLCJhIjoiY2thN2V1bDBxMDJ5bTJ4bGo1a29temsxNCJ9.5DGFqjLK2yLYd9Uab-EyrQ");
  
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibWV0YWxpY2FydXMiLCJhIjoiY2thN2V1bDBxMDJ5bTJ4bGo1a29temsxNCJ9.5DGFqjLK2yLYd9Uab-EyrQ");
    
    var tectLine=new L.LayerGroup();

    d3.json(tectUrl,function(data){
        L.geoJson(data,{
                color:"orange",
                weight:2

        }).addTo(tectLine);
        
    });
    
    // Define a baseMaps object to hold base layers
    var baseMaps = {
      "Satellite": satellite,
      "Grayscale": grayscale,
      "Outdoor":outdoors
    };
    
    // Create overlay object to hold overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "TectonicLine":tectLine
    };
  
    // Create the map, giving streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satellite, tectLine]
    });
  
    // Create a layer control
    // Pass in the baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    tectLine.addTo(myMap);
    

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (myMap) {
      var div = L.DomUtil.create('div', 'info legend');
      var limits = ["0-1","1-2","2-3","3-4","4-5","5+"];
      var colors = [getColor(1),getColor(2),getColor(3),getColor(4),getColor(5),getColor(6)];
      var labels = [];
  
      // Add min & max
      div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
              <div class="max">' + limits[limits.length - 1] + '</div></div>';
  
      limits.forEach(function (limit, index) {
        labels.push('<li style="background-color: ' + colors[index] + '"></li>')
      });
  
      div.innerHTML += '<ul>' + labels.join('') + '</ul>';
      return div;
    }
    legend.addTo(myMap);

   
    d3.json(queryUrl,function(data){


    var getInterval = function(time_data) {

      return {
        start: time_data.properties.time,
        end: time_data.properties.time + time_data.properties.mag * 1800000 * 2
      };
    };

    // Create slider control 
    var sliderControl = L.timelineSliderControl({
      formatOutput: function(date) {
        return new Date(date).toString();
      },
      steps: 500
    });

    // Set the timeline of earthquake using Leaflet's timeline method
    var earthquakeTime = L.timeline(data, {
      getInterval: getInterval,
      pointToLayer: function(data, latlng) {
        return L.circleMarker(latlng, {
          radius: data.properties.mag * 6,
          color:getColor(data.properties.mag),
          opacity: 0.75,
          fillOpacity: 0.75,
          weight: 0
        }).bindPopup("<h3>" + data.properties.place +
        "</h3><hr><p>" + new Date(data.properties.time) + "</p>" + "<p>" +"Magnitude: "+data.properties.mag + "</p>");
      }
    });

    

    // Add slider to map
    sliderControl.addTo(myMap);
    sliderControl.addTimelines(earthquakeTime);

    earthquakeTime.addTo(myMap);
    

  });

    
  
  
  }
