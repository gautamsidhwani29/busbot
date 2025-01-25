import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { OptimizedRoute } from "../types/types";

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  optimizedRoutes: OptimizedRoute[];
}

export default function Map({ optimizedRoutes }: MapProps) {
  const routeColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33F1",
    "#33FFF1",
    "#FFF133",
    "#FF3333",
    "#33FF33",
    "#3333FF",
    "#FF33FF",
  ];

  // Debug optimizedRoutes
  console.log("Optimized Routes:", optimizedRoutes);

  return (
    <MapContainer center={[45.5, -73.6]} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {optimizedRoutes.map((route, index) =>
        route.path && route.id ? (
          <Polyline
            key={route.id}
            positions={route.path}
            color={routeColors[index % routeColors.length]}
            weight={3}
            opacity={0.7}
          >
            <Popup>
              Route {index + 1}
              <br />
              Buses: {route.buses}
              <br />
              Frequency: Every {Math.round(60 / route.frequency)} minutes
            </Popup>
          </Polyline>
        ) : null
      )}
      {optimizedRoutes.flatMap((route) =>
        route.stops.map((stop, stopIndex) =>
          stop.lat != null && stop.lng != null ? (
            <Marker key={`${route.id}-${stopIndex}`} position={[stop.lat, stop.lng]}>
              <Popup>
                Stop: {stop.id}
                <br />
                AM Demand: {stop.amPeakDemand}
                <br />
                PM Demand: {stop.pmPeakDemand}
              </Popup>
            </Marker>
          ) : null
        )
      )}
    </MapContainer>
  );
}
