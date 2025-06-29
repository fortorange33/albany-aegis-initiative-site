require([
  "esri/Map",
  "esri/views/MapView"
], function(Map, MapView) {
  var map = new Map({
    basemap: "streets-navigation-vector"
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-73.7562, 42.6526], // longitude, latitude for Albany, NY
    zoom: 12
  });
});
