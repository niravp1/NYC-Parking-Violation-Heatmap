import React, { useEffect, useRef } from "react";
import api from "../api";

export const InteractiveMarkers = ({ mapRef, rawPointsData, totalMapViolations }) => {

    const markerLayerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || rawPointsData.length === 0 || typeof L === 'undefined') return;

        if (!markerLayerRef.current) {
            markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
        } else {
            markerLayerRef.current.clearLayers();
        }

        rawPointsData.forEach(point => {
            const loadingContent = `
                <div style="font-family: sans-serif; padding: 5px;">
                    <h4 style="margin: 0 0 5px; color: #333;">Precinct ${point.precinct}</h4>
                    <p>Loading detailed summary...</p>
                </div>
            `;

            const circle = L.circle([point.lat, point.lng], {
                radius: 1000,
                fillOpacity: 0,
                opacity: 0,
                weight: 1
            })
                .bindPopup(loadingContent, {
                    maxWidth: 300,
                    autoClose: true,
                    offset: L.point(0, -20)
                });

            circle.on('popupopen', async function (e) {
                const popup = this.getPopup();
                try {
                    const summaryResponse = await api.get(`/precinct_summary/${point.precinct}`);
                    const summary = summaryResponse.data;
                    const totalViolations = summary.total_violations;

                    const percentageOfMapTotal = totalMapViolations > 0 ? ((totalViolations / totalMapViolations) * 100).toFixed(2) : 0;

                    const topViolationsList = summary.top_violations.map((v, index) =>
                        `<li key=${index}>${v.description.substring(0, 40)}: <strong>${v.count.toLocaleString()}</strong></li>`
                    ).join('');

                    const detailedContent = `
                        <div style="font-family: 'Inter', sans-serif; line-height: 1.5; max-width: 280px; padding: 5px;">
                            <h4 style="margin: 0 0 5px; color: #1f2937; font-weight: 600;">Precinct ${summary.precinct} - ${summary.county}</h4>
                            <p style="margin: 0 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
                                <strong>Total Violations:</strong> ${totalViolations.toLocaleString()} 
                                <span style="font-size: 0.8em; color: #6b7280;">(${percentageOfMapTotal}% of map total)</span>
                            </p>
                            
                            <p style="margin: 0 0 8px;"><strong>Most Common Time:</strong> 
                                <span style="font-weight: 600; color: #ef4444;">${summary.most_common_time}</span>
                            </p>
                            
                            <h5 style="margin: 8px 0 3px; font-weight: 500;">Top 3 Violations:</h5>
                            <ul style="margin: 0; padding-left: 20px; font-size: 0.9em; list-style-type: disc;">
                                ${topViolationsList}
                            </ul>
                        </div>
                    `;

                    popup.setContent(detailedContent);
                } catch (err) {
                    popup.setContent("Failed to load detailed precinct data.");
                    console.error(`Error fetching summary for precinct ${point.precinct}:`, err);
                }
            });

            circle.on('mouseover', function () { this.openPopup(); });
            circle.on('mouseout', function () { this.closePopup(); });

            markerLayerRef.current.addLayer(circle);
        });

        return () => {
            if (markerLayerRef.current && mapRef.current) {
                mapRef.current.removeLayer(markerLayerRef.current);
            }
        };

    }, [mapRef, rawPointsData, totalMapViolations]);

    return null;
};