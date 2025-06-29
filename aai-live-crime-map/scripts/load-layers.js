require([
    "esri/layers/FeatureLayer"
  ], function(FeatureLayer) {
    // Copilot: Define a FeatureLayer for Albany crime data and assign it to window.aaiCrimeLayer
    const incidentLayer = new FeatureLayer({
      url: "https://services.arcgis.com/YOUR_ORG_ID/arcgis/rest/services/YOUR_LAYER/FeatureServer/0",
      title: "Albany Crime",
      outFields: ["*"],
      popupTemplate: {
        title: "{crime_type}",
        content: "Date: {incident_date}<br>Location: {location}"
      }
    });
  
    // Export it to attach to the map in map-init.js
    window.aaiCrimeLayer = incidentLayer;
  });