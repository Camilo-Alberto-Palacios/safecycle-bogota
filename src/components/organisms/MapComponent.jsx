import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { localitiesMap } from '../../data/bikeSegments';
import { caiPoints } from '../../data/caiPoints';
import { robberyReports } from '../../data/robberyReports';
import { accidentPoints } from '../../data/accidentPoints';
import { calculateRisk, evaluateCoordinateRisk } from '../../utils/riskCalculator';

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

// Get local key for a LocNombre from GeoJSON
function getLocalityKey(locNombre) {
    if (!locNombre) return null;
    // Normalize to uppercase and strip out Spanish accents/diacritics for robust matching
    const name = locNombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (name.includes('USAQUEN')) return 'usaquen';
    if (name.includes('CHAPINERO')) return 'chapinero';
    if (name.includes('SANTA FE') || name.includes('SANTAFE')) return 'santafe';
    if (name.includes('SAN CRISTOBAL')) return 'sancristobal';
    if (name.includes('USME')) return 'usme';
    if (name.includes('TUNJUELITO')) return 'tunjuelito';
    if (name.includes('BOSA')) return 'bosa';
    if (name.includes('KENNEDY')) return 'kennedy';
    if (name.includes('FONTIBON')) return 'fontibon';
    if (name.includes('ENGATIVA')) return 'engativa';
    if (name.includes('SUBA')) return 'suba';
    if (name.includes('BARRIOS UNIDOS')) return 'barriosunidos';
    if (name.includes('TEUSAQUILLO')) return 'teusaquillo';
    if (name.includes('MARTIRES')) return 'losmartires';
    if (name.includes('ANTONIO NARI')) return 'antonionarino';
    if (name.includes('PUENTE ARANDA')) return 'puentearanda';
    if (name.includes('CANDELARIA')) return 'lacandelaria';
    if (name.includes('RAFAEL URIBE')) return 'ruu';
    if (name.includes('CIUDAD BOLIVAR')) return 'ciudadbolivar';
    if (name.includes('SUMAPAZ')) return 'sumapaz';
    return null;
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
    bikeSegments,
    constructionZones = [],
    showConstruction = true,
    mapLayers = { localities: true, cais: true, construction: true, accidents: true, robberies: true }
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const localidadesLayerRef = useRef(null);
    const activePolygonsRef = useRef({});
    const segmentLayersRef = useRef({});
    const routeLayersRef = useRef([]);
    const routeMarkersRef = useRef({});
    const customAuditMarkerRef = useRef(null);
    const constructionLayersRef = useRef([]);
    const caiLayersRef = useRef([]);
    const robberyLayersRef = useRef([]);
    const accidentLayersRef = useRef([]);

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

        let active = true;

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
                if (!active || !mapRef.current) return;

                const geoJsonLayer = L.geoJSON(data, {
                    style: (feature) => {
                        const locNameRaw = feature.properties.LocNombre;
                        const key = getLocalityKey(locNameRaw);
                        const config = localitiesMap[key];
                        
                        if (config) {
                            const isActive = localidadRef.current === key;
                            const isShown = mapLayers.localities;
                            return {
                                color: isShown ? config.color : 'rgba(0,0,0,0)',
                                weight: isShown ? (isActive ? 4.5 : 2.2) : 0,
                                opacity: isShown ? (isActive ? 1.0 : 0.65) : 0,
                                fillColor: isShown ? config.color : 'rgba(0,0,0,0)',
                                fillOpacity: isShown ? (isActive ? 0.12 : 0.035) : 0
                            };
                        } else {
                            return {
                                color: 'rgba(255, 255, 255, 0.0)',
                                weight: 0,
                                fillColor: 'rgba(255, 255, 255, 0.0)',
                                fillOpacity: 0.0
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

                        // Store references to the polygons
                        const key = getLocalityKey(locNameRaw);
                        if (key) {
                            activePolygonsRef.current[key] = layer;
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
                                const k = getLocalityKey(locNameRaw);
                                const config = localitiesMap[k];
                                if (config) {
                                    const isActive = localidadRef.current === k;
                                    l.setStyle({
                                        color: config.color,
                                        weight: isActive ? 5 : 3,
                                        opacity: 1.0,
                                        fillOpacity: isActive ? 0.2 : 0.08
                                    });
                                }
                            },
                            mouseout: (e) => {
                                const l = e.target;
                                const k = getLocalityKey(locNameRaw);
                                const config = localitiesMap[k];
                                if (config) {
                                    const isActive = localidadRef.current === k;
                                    l.setStyle({
                                        color: config.color,
                                        weight: isActive ? 4.5 : 2.2,
                                        opacity: isActive ? 1.0 : 0.65,
                                        fillOpacity: isActive ? 0.12 : 0.035
                                    });
                                }
                            },
                            click: (e) => {
                                if (selectingModeRef.current) {
                                    L.DomEvent.stopPropagation(e);
                                    callbacksRef.current.onLocationSelect(e.latlng, selectingModeRef.current);
                                    return;
                                }

                                const k = getLocalityKey(locNameRaw);
                                if (k && localitiesMap[k]) {
                                    callbacksRef.current.onLocalidadChange(k);
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
            active = false;
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
                const locNameRaw = feature.properties.LocNombre;
                const key = getLocalityKey(locNameRaw);
                const config = localitiesMap[key];

                if (config) {
                    const isActive = localidad === key;
                    const isShown = mapLayers.localities;
                    return {
                        color: isShown ? config.color : 'rgba(0,0,0,0)',
                        weight: isShown ? (isActive ? 4.5 : 2.2) : 0,
                        opacity: isShown ? (isActive ? 1.0 : 0.65) : 0,
                        fillColor: isShown ? config.color : 'rgba(0,0,0,0)',
                        fillOpacity: isShown ? (isActive ? 0.12 : 0.035) : 0
                    };
                } else {
                    return {
                        color: 'rgba(255, 255, 255, 0.0)',
                        weight: 0,
                        fillColor: 'rgba(255, 255, 255, 0.0)',
                        fillOpacity: 0.0
                    };
                }
            });
        }

        const activeLocConfig = localitiesMap[localidad];
        if (activeLocConfig) {
            map.flyTo(activeLocConfig.center, activeLocConfig.zoom, { duration: 1.5 });
        }
    }, [localidad, mapLayers.localities]);

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

    // 5b. Update active construction zones overlays on the map
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing construction layers
        constructionLayersRef.current.forEach(layer => {
            map.removeLayer(layer);
        });
        constructionLayersRef.current = [];

        if (!showConstruction || !mapLayers.construction) return;

        constructionZones.forEach(zone => {
            // 1. Circle representing the impact radius
            const circle = L.circle([zone.lat, zone.lng], {
                radius: zone.radius,
                color: '#f97316', // Orange
                fillColor: '#f97316',
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: '5, 5',
                interactive: true
            });

            // 2. Custom marker at the center with a construction icon
            const marker = L.marker([zone.lat, zone.lng], {
                icon: L.divIcon({
                    className: 'construction-marker',
                    html: `
                        <div style="
                            width: 28px;
                            height: 28px;
                            background: #f97316;
                            border: 2px solid #fff;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #fff;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                            animation: pulseGlow 2s infinite alternate;
                        ">
                            <i class="fa-solid fa-person-digging" style="font-size: 13px;"></i>
                        </div>
                    `,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            // Bind detailed popup
            const popupContent = `
                <div style="color: #f8fafc; font-family: var(--font-body); font-size: 0.78rem; padding: 0.25rem; min-width: 200px;">
                    <h4 style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: #f97316; display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Zona de Obra Activa
                    </h4>
                    <p style="margin: 0 0 0.4rem 0; font-weight: 600; color: #f1f5f9;">${zone.name}</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.7rem; color: #94a3b8;"><b>Contratista:</b> ${zone.contratista}</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.72rem; color: #cbd5e1; line-height: 1.35;">${zone.description}</p>
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.4rem; font-size: 0.65rem; color: #94a3b8;">
                        <span><b>Fin Estimado:</b> ${zone.endDate}</span>
                        <span style="color: #ef4444; font-weight: 700;">Riesgo: +${zone.riskWeight.toFixed(1)}</span>
                    </div>
                </div>
            `;
            
            circle.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
            marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });

            // Tooltip on hover
            circle.bindTooltip(`<strong>Obra:</strong> ${zone.name}`, { sticky: true, className: 'custom-tooltip' });

            // Add to map
            circle.addTo(map);
            marker.addTo(map);

            // Save references
            constructionLayersRef.current.push(circle);
            constructionLayersRef.current.push(marker);
        });
    }, [constructionZones, showConstruction, mapLayers.construction]);

    // 5c. Update active CAIs overlays on the map
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing CAI layers
        caiLayersRef.current.forEach(layer => {
            map.removeLayer(layer);
        });
        caiLayersRef.current = [];

        if (!mapLayers.cais) return;

        caiPoints.forEach(cai => {
            const marker = L.marker([cai.lat, cai.lng], {
                icon: L.divIcon({
                    className: 'cai-marker-wrapper',
                    html: `
                        <div class="cai-marker" style="
                            width: 28px;
                            height: 28px;
                            background: #1e3a8a;
                            border: 2px solid #38bdf8;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #fff;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                            cursor: pointer;
                        ">
                            <i class="fa-solid fa-shield-halved" style="font-size: 13px;"></i>
                        </div>
                    `,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            const popupContent = `
                <div style="color: #f8fafc; font-family: var(--font-body); font-size: 0.78rem; padding: 0.25rem; min-width: 180px;">
                    <h4 style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: #38bdf8; display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-shield-halved"></i> ${cai.name}
                    </h4>
                    <p style="margin: 0 0 0.4rem 0; font-weight: 600; color: #f1f5f9;">Policía Metropolitana de Bogotá</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.7rem; color: #94a3b8;"><b>Localidad:</b> ${cai.localidad.toUpperCase()}</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.72rem; color: #cbd5e1; line-height: 1.35;"><b>Dirección:</b> ${cai.address}</p>
                    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.4rem; font-size: 0.65rem; color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                        <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulseGlow 1.5s infinite alternate;"></span>
                        <span>Activo • Vigilancia 24h</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
            marker.bindTooltip(`<strong>CAI:</strong> ${cai.name}`, { sticky: true, className: 'custom-tooltip' });

            marker.addTo(map);
            caiLayersRef.current.push(marker);
        });
    }, [mapLayers.cais]);

    // 5d. Update active Robbery Reports overlays on the map
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing robbery layers
        robberyLayersRef.current.forEach(layer => {
            map.removeLayer(layer);
        });
        robberyLayersRef.current = [];

        if (!mapLayers.robberies) return;

        robberyReports.forEach(rob => {
            const marker = L.marker([rob.lat, rob.lng], {
                icon: L.divIcon({
                    className: 'robbery-marker-wrapper',
                    html: `
                        <div class="robbery-marker" style="
                            width: 28px;
                            height: 28px;
                            background: #ef4444;
                            border: 2px solid #fca5a5;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #fff;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                            cursor: pointer;
                        ">
                            <i class="fa-solid fa-mask" style="font-size: 13px;"></i>
                        </div>
                    `,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            const popupContent = `
                <div style="color: #f8fafc; font-family: var(--font-body); font-size: 0.78rem; padding: 0.25rem; min-width: 180px;">
                    <h4 style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: #ef4444; display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-mask"></i> ${rob.name}
                    </h4>
                    <p style="margin: 0 0 0.4rem 0; font-weight: 600; color: #f1f5f9;">Reporte de Hurto (Últimas 24h)</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.7rem; color: #94a3b8;"><b>Localidad:</b> ${rob.localidad.toUpperCase()} • <b>Hora:</b> ${rob.time}</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.72rem; color: #cbd5e1; line-height: 1.35;"><b>Detalle:</b> ${rob.description}</p>
                    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.4rem; font-size: 0.65rem; color: #ef4444; font-weight: 700;">
                        <span>Caso Reportado a Policía Cuadrante</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
            marker.bindTooltip(`<strong>Hurto:</strong> ${rob.name} (${rob.time})`, { sticky: true, className: 'custom-tooltip' });

            marker.addTo(map);
            robberyLayersRef.current.push(marker);
        });
    }, [mapLayers.robberies]);

    // 5e. Update active Accident overlays on the map
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing accident layers
        accidentLayersRef.current.forEach(layer => {
            map.removeLayer(layer);
        });
        accidentLayersRef.current = [];

        if (!mapLayers.accidents) return;

        accidentPoints.forEach(acc => {
            const marker = L.marker([acc.lat, acc.lng], {
                icon: L.divIcon({
                    className: 'accident-marker-wrapper',
                    html: `
                        <div class="accident-marker" style="
                            width: 28px;
                            height: 28px;
                            background: #eab308;
                            border: 2px solid #fde047;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #000;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                            cursor: pointer;
                        ">
                            <i class="fa-solid fa-car-burst" style="font-size: 13px;"></i>
                        </div>
                    `,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            const popupContent = `
                <div style="color: #f8fafc; font-family: var(--font-body); font-size: 0.78rem; padding: 0.25rem; min-width: 180px;">
                    <h4 style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: #eab308; display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-car-burst"></i> ${acc.name}
                    </h4>
                    <p style="margin: 0 0 0.4rem 0; font-weight: 600; color: #f1f5f9;">Accidente de Tránsito Reciente</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.7rem; color: #94a3b8;"><b>Localidad:</b> ${acc.localidad.toUpperCase()} • <b>Hora:</b> ${acc.time} • <b>Severidad:</b> ${acc.severity}</p>
                    <p style="margin: 0 0 0.4rem 0; font-size: 0.72rem; color: #cbd5e1; line-height: 1.35;"><b>Detalle:</b> ${acc.description}</p>
                    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.4rem; font-size: 0.65rem; color: #eab308; font-weight: 700;">
                        <span>Tránsito Bogotá Regulando</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
            marker.bindTooltip(`<strong>Tránsito:</strong> ${acc.name} (${acc.time})`, { sticky: true, className: 'custom-tooltip' });

            marker.addTo(map);
            accidentLayersRef.current.push(marker);
        });
    }, [mapLayers.accidents]);

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
                
                const risk = evaluateCoordinateRisk(midLat, midLng, bikeSegments, simulationState, constructionZones, showConstruction);
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

            // Recalculate segment risk using our helper
            const segmentWithState = { ...segment, ...simulationState };
            const prediction = calculateRisk(segmentWithState, constructionZones, showConstruction);

            const color = getRiskColor(prediction.level);
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
                <h4>Leyenda de Riesgo</h4>
                <div className="legend-items">
                    <span className="legend-item"><span className="color-dot dot-low"></span> Bajo</span>
                    <span className="legend-item"><span className="color-dot dot-mid"></span> Medio</span>
                    <span className="legend-item"><span className="color-dot dot-high"></span> Alto</span>
                </div>
            </div>
        </div>
    );
}
