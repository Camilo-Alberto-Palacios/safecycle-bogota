import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { localitiesMap } from '../../data/bikeSegments';
import { evaluateCoordinateRisk } from '../../utils/riskCalculator';

// Helper to check if a point is inside a polygon (Ray-Casting Algorithm)
function isPointInPolygon(point, polygonCoords) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
        const xi = polygonCoords[i][0], yi = polygonCoords[i][1];
        const xj = polygonCoords[j][0], yj = polygonCoords[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Get HEX color for a risk level
function getRiskColor(level) {
    if (level === 'Alto') return '#ef4444';
    if (level === 'Medio') return '#f59e0b';
    return '#10b981';
}

export default function MapComponent({
    localidad,
    onLocalidadChange,
    selectedSegmentId,
    onSelectSegment,
    onMapAuditClick,
    routePoints,
    selectingLocationMode,
    onLocationSelect,
    generatedRoutes = [],
    activeRouteId,
    onSelectRoute,
    simulationState,
    bikeSegments
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const localidadesLayerRef = useRef(null);
    const activePolygonsRef = useRef({});
    const segmentLayersRef = useRef({});
    const routeLayersRef = useRef([]);
    const routeMarkersRef = useRef({});
    const customAuditMarkerRef = useRef(null);

    // Keep refs of callbacks to avoid re-triggering effects
    const callbacksRef = useRef({});
    callbacksRef.current = {
        onSelectSegment,
        onMapAuditClick,
        onLocationSelect,
        onSelectRoute,
        onLocalidadChange
    };

    // Keep ref of selecting location mode
    const selectingModeRef = useRef(selectingLocationMode);
    selectingModeRef.current = selectingLocationMode;

    const localidadRef = useRef(localidad);
    localidadRef.current = localidad;

    const simulationStateRef = useRef(simulationState);
    simulationStateRef.current = simulationState;

    const bikeSegmentsRef = useRef(bikeSegments);
    bikeSegmentsRef.current = bikeSegments;

    // 1. Initial Mount: Initialize Leaflet Map and Fetch GeoJSON Boundaries
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Center initially in Usme
        const map = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: true
        }).setView([4.506, -74.115], 13);

        mapRef.current = map;

        // Light Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Fetch official Bogotá Localities GeoJSON
        fetch(`${import.meta.env.BASE_URL}localidades.json`)
            .then(res => res.json())
            .then(data => {
                const geoJsonLayer = L.geoJSON(data, {
                    style: (feature) => {
                        const locName = feature.properties.LocNombre.toUpperCase();
                        if (locName.includes('USME')) {
                            const isActive = localidadRef.current === 'usme';
                            return {
                                color: '#6366f1',
                                weight: isActive ? 3.5 : 1.5,
                                fillColor: '#6366f1',
                                fillOpacity: isActive ? 0.05 : 0.015,
                                dashArray: isActive ? null : '3, 6'
                            };
                        } else if (locName.includes('RAFAEL URIBE')) {
                            const isActive = localidadRef.current === 'ruu';
                            return {
                                color: '#a855f7',
                                weight: isActive ? 3.5 : 1.5,
                                fillColor: '#a855f7',
                                fillOpacity: isActive ? 0.05 : 0.015,
                                dashArray: isActive ? null : '3, 6'
                            };
                        } else {
                            return {
                                color: 'rgba(255, 255, 255, 0.22)',
                                weight: 1,
                                fillColor: 'rgba(255, 255, 255, 0.03)',
                                fillOpacity: 0.005,
                                dashArray: '2, 4'
                            };
                        }
                    },
                    onEachFeature: (feature, layer) => {
                        const locNameRaw = feature.properties.LocNombre;
                        // Clean encoding discrepancies
                        let locName = locNameRaw;
                        if (locNameRaw.includes('NARI')) locName = 'Antonio Nariño';
                        else if (locNameRaw.includes('ENGATIVA')) locName = 'Engativá';
                        else if (locNameRaw.includes('SAN CRISTOBAL')) locName = 'San Cristóbal';
                        else if (locNameRaw.includes('USAQUEN')) locName = 'Usaquén';
                        else if (locNameRaw.includes('MARTIRES')) locName = 'Los Mártires';
                        else if (locNameRaw.includes('FONTI')) locName = 'Fontibón';
                        else if (locNameRaw.includes('CIUDAD BOLIVAR')) locName = 'Ciudad Bolívar';
                        else if (locNameRaw.includes('FONTIBON')) locName = 'Fontibón';
                        else {
                            locName = locNameRaw.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                        }

                        // Store references to the active polygons
                        const upperName = locNameRaw.toUpperCase();
                        if (upperName.includes('USME')) {
                            activePolygonsRef.current.usme = layer;
                        } else if (upperName.includes('RAFAEL URIBE')) {
                            activePolygonsRef.current.ruu = layer;
                        }

                        // Bind hover tooltip
                        layer.bindTooltip(`<div class="locality-map-tooltip"><b>Localidad de ${locName}</b></div>`, {
                            sticky: true,
                            className: 'custom-tooltip'
                        });

                        // Interactive features
                        layer.on({
                            mouseover: (e) => {
                                const l = e.target;
                                const name = feature.properties.LocNombre.toUpperCase();
                                if (!name.includes('USME') && !name.includes('RAFAEL URIBE')) {
                                    l.setStyle({
                                        color: 'rgba(255, 255, 255, 0.55)',
                                        fillOpacity: 0.04
                                    });
                                }
                            },
                            mouseout: (e) => {
                                const l = e.target;
                                const name = feature.properties.LocNombre.toUpperCase();
                                if (!name.includes('USME') && !name.includes('RAFAEL URIBE')) {
                                    l.setStyle({
                                        color: 'rgba(255, 255, 255, 0.22)',
                                        fillOpacity: 0.005
                                    });
                                }
                            },
                            click: (e) => {
                                const name = feature.properties.LocNombre.toUpperCase();
                                if (name.includes('USME')) {
                                    callbacksRef.current.onLocalidadChange('usme');
                                } else if (name.includes('RAFAEL URIBE')) {
                                    callbacksRef.current.onLocalidadChange('ruu');
                                } else {
                                    L.popup()
                                        .setLatLng(e.latlng)
                                        .setContent(`
                                            <div style="color: #f8fafc; font-family: var(--font-body); font-size: 0.8rem; padding: 0.2rem;">
                                                <h4 style="font-family: var(--font-heading); font-weight: 700; margin-bottom: 0.25rem; color: #a855f7;">
                                                    Localidad de ${locName}
                                                </h4>
                                                <p style="margin: 0; color: #94a3b8; font-size: 0.75rem; line-height: 1.3;">
                                                    La simulación predictiva de seguridad está activa en <b>Usme</b> y <b>Rafael Uribe Uribe</b>. ¡Próximamente más localidades!
                                                </p>
                                            </div>
                                        `)
                                        .openOn(mapRef.current);
                                }
                            }
                        });
                    }
                }).addTo(map);

                localidadesLayerRef.current = geoJsonLayer;
            })
            .catch(err => console.error("Error loading localidades GeoJSON:", err));

        // Draw initial segments
        Object.keys(bikeSegmentsRef.current).forEach(id => {
            const segment = bikeSegmentsRef.current[id];
            const polyline = L.polyline(segment.coordinates, {
                color: '#6366f1',
                weight: 0,
                opacity: 0,
                lineJoin: 'round',
                interactive: false
            }).addTo(map);

            segmentLayersRef.current[id] = polyline;
        });

        // Listen for Map Clicks
        map.on('click', (e) => {
            if (selectingModeRef.current) {
                callbacksRef.current.onLocationSelect(e.latlng, selectingModeRef.current);
                return;
            }

            const clickedPoint = [e.latlng.lat, e.latlng.lng];
            let insideActive = false;
            
            const activeLoc = localidadRef.current;
            const activeLayer = activePolygonsRef.current[activeLoc];
            
            if (activeLayer) {
                let latlngs = activeLayer.getLatLngs();
                let coords = [];
                if (Array.isArray(latlngs[0])) {
                    if (Array.isArray(latlngs[0][0])) {
                        coords = latlngs[0][0].map(ll => [ll.lat, ll.lng]);
                    } else {
                        coords = latlngs[0].map(ll => [ll.lat, ll.lng]);
                    }
                } else {
                    coords = latlngs.map(ll => [ll.lat, ll.lng]);
                }
                insideActive = isPointInPolygon(clickedPoint, coords);
            }
            
            if (insideActive) {
                callbacksRef.current.onMapAuditClick(e.latlng);
            }
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // 2. Adjust cursor based on selecting location mode
    useEffect(() => {
        const container = mapContainerRef.current;
        if (container) {
            if (selectingLocationMode) {
                container.style.cursor = 'crosshair';
            } else {
                container.style.cursor = '';
            }
        }
    }, [selectingLocationMode]);

    // 3. Pan and update styles when Localidad changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Update GeoJSON styles dynamically
        if (localidadesLayerRef.current) {
            localidadesLayerRef.current.setStyle((feature) => {
                const locName = feature.properties.LocNombre.toUpperCase();
                if (locName.includes('USME')) {
                    const isActive = localidad === 'usme';
                    return {
                        color: '#6366f1',
                        weight: isActive ? 3.5 : 1.5,
                        fillOpacity: isActive ? 0.05 : 0.015,
                        dashArray: isActive ? null : '3, 6'
                    };
                } else if (locName.includes('RAFAEL URIBE')) {
                    const isActive = localidad === 'ruu';
                    return {
                        color: '#a855f7',
                        weight: isActive ? 3.5 : 1.5,
                        fillOpacity: isActive ? 0.05 : 0.015,
                        dashArray: isActive ? null : '3, 6'
                    };
                } else {
                    return {
                        color: 'rgba(255, 255, 255, 0.22)',
                        weight: 1,
                        fillOpacity: 0.005,
                        dashArray: '2, 4'
                    };
                }
            });
        }

        if (localidad === 'usme') {
            map.flyTo([4.506, -74.115], 13, { duration: 1.5 });
        } else {
            map.flyTo([4.575, -74.122], 14, { duration: 1.5 });
        }
    }, [localidad]);

    // 4. Update route markers (Origin/Destination Pins)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing markers
        ['origin', 'destination'].forEach(mode => {
            if (routeMarkersRef.current[mode]) {
                map.removeLayer(routeMarkersRef.current[mode]);
                routeMarkersRef.current[mode] = null;
            }
        });

        // Add new markers if coordinates are set
        ['origin', 'destination'].forEach(mode => {
            const pt = routePoints[mode];
            if (pt) {
                const iconColor = mode === 'origin' ? '#10b981' : '#ef4444';
                const label = mode === 'origin' ? 'Origen' : 'Destino';
                
                const marker = L.marker([pt.lat, pt.lng], {
                    icon: L.divIcon({
                        className: 'route-point-marker',
                        html: `<i class="fa-solid fa-location-dot" style="font-size: 24px; color: ${iconColor}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(map);

                marker.bindTooltip(`<strong>${label}</strong><br>Lat: ${pt.lat.toFixed(4)}, Lng: ${pt.lng.toFixed(4)}`, {
                    className: 'custom-tooltip'
                });

                routeMarkersRef.current[mode] = marker;
            }
        });
    }, [routePoints]);

    // 5. Update custom audit marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing
        if (customAuditMarkerRef.current) {
            map.removeLayer(customAuditMarkerRef.current);
            customAuditMarkerRef.current = null;
        }

        // Add if custom segment exists and is active
        if (selectedSegmentId === 'custom_audit' && bikeSegments.custom_audit) {
            const seg = bikeSegments.custom_audit;
            const latlng = seg.coordinates[0];

            const marker = L.marker([latlng[0], latlng[1]], {
                icon: L.divIcon({
                    className: 'custom-audit-pin',
                    html: '<i class="fa-solid fa-location-crosshairs text-accent" style="font-size: 22px; filter: drop-shadow(0 0 5px rgba(99,102,241,0.8));"></i>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                })
            }).addTo(map);

            marker.bindTooltip(`<strong>Punto de Auditoría</strong><br>Lat: ${latlng[0].toFixed(4)} Lng: ${latlng[1].toFixed(4)}`, {
                sticky: true,
                className: 'custom-tooltip'
            });

            customAuditMarkerRef.current = marker;
        }
    }, [selectedSegmentId, bikeSegments.custom_audit]);

    // 6. Draw route polylines dynamically segmented by CPTED risk
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing route layers
        routeLayersRef.current.forEach(layerGroup => {
            map.removeLayer(layerGroup);
        });
        routeLayersRef.current = [];

        // Render generated routes
        generatedRoutes.forEach(route => {
            const isActive = route.id === activeRouteId;
            const group = L.layerGroup();
            
            const routeCoords = route.coordinates;
            for (let i = 0; i < routeCoords.length - 1; i++) {
                const pt1 = routeCoords[i];
                const pt2 = routeCoords[i+1];
                
                const midLat = (pt1[0] + pt2[0]) / 2;
                const midLng = (pt1[1] + pt2[1]) / 2;
                
                const risk = evaluateCoordinateRisk(midLat, midLng, bikeSegments, simulationState);
                const color = getRiskColor(risk.level);
                
                const polyline = L.polyline([pt1, pt2], {
                    color: color,
                    weight: isActive ? 8 : 4,
                    opacity: isActive ? 0.95 : 0.25,
                    lineJoin: 'round'
                });
                
                polyline.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    callbacksRef.current.onSelectRoute(route.id);
                });
                
                polyline.bindTooltip(`<strong>${route.name}</strong><br>Distancia: ${route.distanceKm} km<br>Riesgo Promedio: ${route.avgRiskScore}`, {
                    sticky: true,
                    className: 'custom-tooltip'
                });

                group.addLayer(polyline);
            }
            
            group.addTo(map);
            routeLayersRef.current.push(group);
        });
    }, [generatedRoutes, activeRouteId, simulationState, bikeSegments]);

    // 7. Update segment polyline colors and interaction (For audit mode)
    useEffect(() => {
        // Clear all segment visibilities first
        Object.keys(segmentLayersRef.current).forEach(id => {
            const layer = segmentLayersRef.current[id];
            if (layer) {
                layer.setStyle({ weight: 0, opacity: 0 });
                layer.options.interactive = false;
            }
        });

        // If a segment is selected and it is not a custom audit point
        if (selectedSegmentId && selectedSegmentId !== 'custom_audit' && segmentLayersRef.current[selectedSegmentId]) {
            const segment = bikeSegments[selectedSegmentId];
            if (!segment) return;

            // Recalculate segment risk
            const baseValue = 5.0;
            let shapCrime = 0.0;
            if (segment.baselineCrime === 'Alto') shapCrime = 2.4;
            else if (segment.baselineCrime === 'Medio') shapCrime = 0.2;
            else if (segment.baselineCrime === 'Bajo') shapCrime = -2.1;

            const { weather, lightingType, watts, visibility, guardianCai, guardianRuta } = simulationState;

            const shapWeather = (weather === 'lluvia') ? 1.4 : -0.3;
            const shapLightingTech = (lightingType === 'Sodio') ? 0.7 : -0.8;
            const shapLightingPower = 0.4 - ((watts - 50) / 200) * 1.1;

            let shapVisibility = 0.0;
            if (visibility === 1) shapVisibility = 0.9;
            else if (visibility === 3) shapVisibility = -1.0;

            const shapCai = guardianCai ? -1.3 : 0.0;
            const shapRuta = guardianRuta ? -0.9 : 0.0;

            let score = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + (shapCai + shapRuta);
            score = Math.max(0.5, Math.min(9.5, score));

            let level = 'Bajo';
            if (score >= 7.0) level = 'Alto';
            else if (score >= 3.8) level = 'Medio';

            const color = getRiskColor(level);
            const layer = segmentLayersRef.current[selectedSegmentId];
            
            layer.setStyle({
                weight: 9,
                opacity: 0.9,
                color: color
            });
            layer.options.interactive = true;
            layer.bringToFront();
        }
    }, [selectedSegmentId, simulationState, bikeSegments]);

    // 8. Auto-resize map when container width/height changes (collapsing drawers)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });

        if (mapContainerRef.current) {
            resizeObserver.observe(mapContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="map-container-wrapper">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
            
            {/* Map Legend Overlay */}
            <div className="map-legend">
                <h4>Riesgo del Tramo</h4>
                <div className="legend-items">
                    <span className="legend-item"><span className="color-dot dot-low"></span> Bajo</span>
                    <span className="legend-item"><span className="color-dot dot-mid"></span> Medio</span>
                    <span className="legend-item"><span className="color-dot dot-high"></span> Alto</span>
                </div>
            </div>
        </div>
    );
}
