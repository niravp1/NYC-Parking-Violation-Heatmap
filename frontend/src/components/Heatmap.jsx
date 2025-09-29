import React, { useEffect, useState, useRef } from "react"
import { InteractiveMarkers } from "./Markers";
import api from "../api"

if (typeof L !== "undefined") {
  Object.defineProperty(MouseEvent.prototype, "mozInputSource", {
    get() { return this.pointerType; },
  });

  Object.defineProperty(MouseEvent.prototype, "mozPressure", {
    get() { return this.pressure; },
  });
}
const Heatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawPointsData, setRawPointsData] = useState([]);
    const [maxWeight, setMaxWeight] = useState(1);
    const [totalMapViolations, setTotalMapViolations] = useState(0);

    const mapRef = useRef(null);
    const heatLayerRef = useRef(null);
    const geocoderRef = useRef(null);
    const searchMarkerRef = useRef(null); // track the search marker

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const response = await api.get("/heatmap_data");
                const rawPoints = response.data.points;
                const maxWeight = response.data.max_weight;
                const totalViolations = rawPoints.reduce((sum, p) => sum + p.weight, 0);
                setRawPointsData(rawPoints);
                setTotalMapViolations(totalViolations);

                const formattedData = rawPoints.map(point => [
                    point.lat,
                    point.lng,
                    point.weight / 750
                ]);
                setHeatmapData(formattedData);
                setError(null);
            } catch (err) {
                console.error("Error fetching heatmap data:", err);
                setError("Failed to load heatmap data.");
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);

    useEffect(() => {
        if (loading || error) return;

        if (typeof L === 'undefined') {
            console.error("Leaflet not loaded. Check index.html scripts.");
            return;
        }

        if (!mapRef.current) {
            const nyc_coords = [40.730610, -73.935242];

            mapRef.current = L.map('map-container').setView(nyc_coords, 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }

        if (mapRef.current && heatmapData.length > 0) {
            if (heatLayerRef.current) {
                mapRef.current.removeLayer(heatLayerRef.current);
            }

            const customGradient = {
                '0.0': 'blue',
                '0.4': 'lime',
                '0.6': 'yellow',
                '0.8': 'orange',
                '1.0': 'red'
            };

            heatLayerRef.current = L.heatLayer(heatmapData, {
                radius: 100,
                blur: 20,
                maxZoom: 17,
                gradient: customGradient
            }).addTo(mapRef.current);
        }

        if (!geocoderRef.current) {
            const arrowIcon = L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // arrow/pin icon
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });

            geocoderRef.current = L.Control.geocoder({
                defaultMarkGeocode: false,
                collapsed: true,
                placeholder: 'Search for address or place...',
            })
                .on('markgeocode', function (e) {
                    const latlng = e.geocode.center;

                    if (searchMarkerRef.current) {
                        mapRef.current.removeLayer(searchMarkerRef.current);
                    }

                    searchMarkerRef.current = L.marker(latlng, { icon: arrowIcon }).addTo(mapRef.current);

                    mapRef.current.setView(latlng, 16);
                })
                .addTo(mapRef.current);
        }
    }, [heatmapData, loading, error]);

    return (
        <div style={{ height: '90vh', width: '90vw', marginLeft: '4vw' }}>
            {loading && <p>Loading map data...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <div id="map-container" style={{ height: '100%', width: '100%' }}>
                {!loading && heatmapData.length === 0 && !error && (
                    <p>No violation data to display for heatmap.</p>
                )}
                <InteractiveMarkers
                    mapRef={mapRef}
                    rawPointsData={rawPointsData}
                    totalMapViolations={totalMapViolations}
                />
            </div>
        </div>
    );
};

export default Heatmap;