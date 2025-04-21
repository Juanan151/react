// components/MapView.jsx
import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ events }) {
  useEffect(() => {
    if (!events || events.length === 0) return;

    const existing = document.getElementById("map");
    if (existing._leaflet_id) {
      existing._leaflet_id = null;
    }

    const map = L.map("map").setView(
      [events[0].latitude, events[0].longitude],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const latlngs = [];

    events.forEach((e, i) => {
      const { latitude, longitude, altitude, speed, satellites } = e;
      const position = [latitude, longitude];
      latlngs.push(position);

      const isLast = i === events.length - 1;
      const baseColor = isLast ? "#ef4444" : "#3b82f6";

      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:${baseColor};color:white;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;">${i + 1}</div>`,
      });

      const popupContent = `
        <b>Punto ${i + 1}${isLast ? " (último)" : ""}</b><br>
        Altitud: ${altitude} m<br>
        Velocidad: ${speed} km/h<br>
        Satélites: ${satellites}
        ${isLast ? "<br><span style='color:#ef4444;font-weight:bold;'>Última ubicación registrada</span>" : ""}
      `;

      L.marker(position, { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    L.polyline(latlngs, { color: "blue", weight: 3 }).addTo(map);

    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [20, 20] });

    return () => map.remove();
  }, [events]);

  return (
    <div id="map" className="w-full h-full rounded-lg" />
  );
}
