require([
    "esri/layers/FeatureLayer"
  ], function(FeatureLayer) {
    // Example: Crime incident FeatureLayer
    const incidentLayer = new FeatureLayer({
      url: "https://services.arcgis.com/YOUR_ORG_ID/arcgis/rest/services/YOUR_LAYER_NAME/FeatureServer/0",
      title: "Crime Incidents",
      outFields: ["*"],
      popupTemplate: {
        title: "{crime_type}",
        content: "Location: {location}<br>Date: {incident_date}"
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: [226, 119, 40],
          size: 6,
          outline: {
            color: [255, 255, 255],
            width: 1
          }
        }
      }
    });
  
    // Export it to attach to the map in map-init.js
    window.aaiCrimeLayer = incidentLayer;
  });