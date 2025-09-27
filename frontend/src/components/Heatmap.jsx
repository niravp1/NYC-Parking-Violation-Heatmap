import React, { useEffect, useState, useRef } from "react"
import { InteractiveMarkers } from "./Markers";
import api from "../api"

const Heatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawPointsData, setRawPointsData] = useState([]); 
    const [maxWeight, setMaxWeight] = useState(1); 
    const [totalMapViolations, setTotalMapViolations] = useState(0); 
    const mapRef = useRef(null);
    const heatLayerRef = useRef(null);

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

        if (loading || error) {
            return; 
        }

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
                '0.0': 'blue',    // Start with blue for low count
                '0.4': 'lime',    // Transition to lime green
                '0.6': 'yellow',  // Transition to yellow
                '0.8': 'orange',  // Transition to orange
                '1.0': 'red'      // End with red for max count
            };

            heatLayerRef.current = L.heatLayer(heatmapData, {
                radius: 100,
                blur: 20,
                maxZoom: 17,
                gradient: customGradient
            }).addTo(mapRef.current);

        }

    }, [heatmapData, loading, error]); 

    return (
        <div style={{ height: '90vh', width: '90vw', marginLeft: '4vw'}}>
            {loading && <p>Loading map data...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {/* The map will be rendered into this div by Leaflet */}
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
