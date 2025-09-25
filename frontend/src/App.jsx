import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
  const position = [40.7128, -74.0060];
  const zoomLevel = 15;

  return (
    <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        style={{ height: '100vh', width: '100vw' }} 
        scrollWheelZoom={true} 
    >
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      
    </MapContainer>
  );
}

export default MapComponent;