require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer"
], function(Map, MapView, FeatureLayer) {
  var map = new Map({
    basemap: "streets-navigation-vector"
  });

  // Wait for aaiCrimeLayer loaded via load-layers.js
  setTimeout(() => {
    if (window.aaiCrimeLayer) {
      map.add(window.aaiCrimeLayer);
    }
  }, 1000);

  // add a feature layer from ArcGIS FeatureServer
  var featureLayer = new FeatureLayer({
    url: "https://services.arcgis.com/.../FeatureServer/0"
  });
  map.add(featureLayer);

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-73.7562, 42.6526], // longitude, latitude for Albany, NY
    zoom: 12
  });
});
