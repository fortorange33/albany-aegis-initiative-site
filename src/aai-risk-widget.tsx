import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Type-safe GeoJSON types
type GeoJsonFeature = {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: { [key: string]: any };
};

type GeoJsonObject = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const Widget: React.FC = () => {
  const [geo, setGeo] = useState<GeoJsonObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/assets/tracts.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json() as Promise<GeoJsonObject>;
      })
      .then((data) => {
        setGeo(data);
        setError(null);
      })
      .catch((e) => {
        console.error("Failed to load GeoJSON data:", e);
        setGeo(null);
        setError("Unable to load map.");
      });
  }, []);

  return (
    <div className="rounded-lg shadow-sm p-3 bg-body">
      <h3 className="h5 mb-2">Crime-Risk Explorer</h3>

      {!geo && !error && (
        <div style={{ color: "#666", fontStyle: "italic" }}>
          Loading map...
        </div>
      )}

      {error ? (
        <div role="alert" style={{ color: "#b00", fontWeight: 500 }}>
          {error}
        </div>
      ) : geo ? (
        <MapContainer style={{ height: 400 }} zoom={11} center={[42.65, -73.76]}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={geo} />
        </MapContainer>
      ) : null}

      {/* Chat panel placeholder */}
    </div>
  );
};

// Mount the widget after page load
const container = document.getElementById("aai-risk-widget");
if (container) {
  ReactDOM.createRoot(container).render(<Widget />);
} else {
  console.error("Root container #aai-risk-widget not found");
}
