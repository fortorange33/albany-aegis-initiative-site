require([
    "esri/layers/FeatureLayer"
  ], function(FeatureLayer) {
    // Create a FeatureLayer for Albany Common Council Districts
    const wardLayer = new FeatureLayer({
      url: "https://services.arcgis.com/YOUR_ORG_ID/arcgis/rest/services/Albany_Ward_Boundaries/FeatureServer/0",
      title: "Common Council Wards",
      visible: false,
      opacity: 0.5,
      outFields: ["*"],
      popupTemplate: {
        title: "Ward {Ward_Number}",
        content: "This area is represented by Council District {Ward_Number}."
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [51, 102, 204, 0.1],
          outline: {
            color: [51, 102, 204],
            width: 1
          }
        }
      }
    });
  
    // Export to window so other scripts (e.g. map-init.js) can use it
    window.wardLayer = wardLayer;
  });