import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Widget = () => {
  const [geo, setGeo] = useState<any>(null);

  useEffect(() => {
    fetch("/assets/tracts.geojson").then(r => r.json()).then(setGeo);
  }, []);

  return (
    <div className="rounded-lg shadow-sm p-3 bg-body">
      <h3 className="h5 mb-2">Crime-Risk Explorer</h3>
      {geo && (
        <MapContainer style={{ height: 400 }} zoom={11} center={[42.65, -73.76]}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={geo} />
        </MapContainer>
      )}
      {/* Chat panel placeholder */}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("aai-risk-widget")!).render(<Widget />);
