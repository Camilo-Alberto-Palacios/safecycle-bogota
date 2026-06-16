import React, { useState, useEffect } from 'react';
import FloatingHeader from '../organisms/FloatingHeader';
import RoutePlanner from '../organisms/RoutePlanner';
import SimulatorPanel from '../organisms/SimulatorPanel';
import ResultsPanel from '../organisms/ResultsPanel';
import StatsPanel from '../organisms/StatsPanel';
import MapComponent from '../organisms/MapComponent';
import DashboardLayout from '../templates/DashboardLayout';

import { bikeSegments as initialSegments, localitiesMap } from '../../data/bikeSegments';
import { constructionZones } from '../../data/constructionZones';
import { trafficJams } from '../../data/trafficJams';
import { 
    calculateRisk, 
    getRecommendations, 
    getRouteRecommendations, 
    findNearestSegment,
    calculateRouteAverageRisk,
    detectTrafficJamsOnRoute,
    calculateRouteCost,
    calcularRiesgoCiudadano
} from '../../utils/riskCalculator';
import CitizenSciencePanel from '../organisms/CitizenSciencePanel';

export default function MainDashboard() {
    // 1. Localities and View Modes
    const [localidad, setLocalidad] = useState('usme');
    const [viewMode, setViewMode] = useState('citizen');

    // 2. Segment Data State (allows adding custom_audit dynamically)
    const [segments, setSegments] = useState(initialSegments);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);

    // 3. Simulation Controls State (binds to active selection)
    const [simulationState, setSimulationState] = useState({
        weather: 'seco',
        lightingType: 'Sodio',
        watts: 100,
        visibility: 2,
        guardianCai: false,
        guardianRuta: false,
        showConstruction: true,
        trafficJams: false,
        accidents: false
    });

    // Map Layers Visibility State
    const [mapLayers, setMapLayers] = useState({
        localities: true,
        cais: true,
        construction: true,
        accidents: true,
        robberies: true,
        trafficJams: true,
        citizenReports: true
    });

    // 3b. Citizen Science and Reports State
    const [citizenReports, setCitizenReports] = useState([]);
    const [isReporting, setIsReporting] = useState(false);
    const [reportingType, setReportingType] = useState('Luminaria Dañada / Boca de lobo');
    const [reportingCoords, setReportingCoords] = useState(null);
    const [isSelectingCoords, setIsSelectingCoords] = useState(false);
    const [zoomToCoords, setZoomToCoords] = useState(null);

    // 4. Route Planning State
    const [originInput, setOriginInput] = useState('Portal Usme');
    const [destInput, setDestInput] = useState('');
    const [selectingLocationMode, setSelectingLocationMode] = useState(null);
    const [routePoints, setRoutePoints] = useState({ origin: null, destination: null });
    const [generatedRoutes, setGeneratedRoutes] = useState([]);
    const [activeRouteId, setActiveRouteId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 5. Update default origin when localidad changes
    useEffect(() => {
        if (localidad === 'usme') {
            setOriginInput('Portal Usme');
        } else {
            setOriginInput('Molinos');
        }
    }, [localidad]);

    // 6. Handle localidad switch
    const handleLocalidadChange = (loc) => {
        if (loc === localidad) return;
        setLocalidad(loc);
        handleClearRoute();
    };

    // 7. Select a segment (auditing)
    const handleSelectSegment = (id) => {
        setSelectedSegmentId(id);
        const segment = segments[id];
        if (segment) {
            setSimulationState({
                weather: segment.weather || 'seco',
                lightingType: segment.lightingType || 'Sodio',
                watts: segment.watts || 100,
                visibility: segment.visibility || 2,
                guardianCai: segment.guardianCai || false,
                guardianRuta: segment.guardianRuta || false,
                showConstruction: segment.showConstruction !== false,
                trafficJams: segment.trafficJams || false,
                accidents: segment.accidents || false
            });
        }
    };

    // 8. Update simulation state values dynamically
    const handleSimulationStateChange = (key, value) => {
        setSimulationState(prev => {
            const updated = { ...prev, [key]: value };
            
            // Sync back to our segments database copy so map reflects changes
            if (selectedSegmentId) {
                setSegments(oldSegs => ({
                    ...oldSegs,
                    [selectedSegmentId]: {
                        ...oldSegs[selectedSegmentId],
                        [key]: value
                    }
                }));
            }
            return updated;
        });
    };

    // 9. Handle map clicks to create custom audit points
    const handleMapAuditClick = (latlng) => {
        const nearest = findNearestSegment(latlng, segments);
        
        const auditId = 'custom_audit';
        const activeLocalityConfig = localitiesMap[localidad];
        const customSeg = {
            id: auditId,
            name: `Calle Auditada (Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)})`,
            localidad: activeLocalityConfig ? activeLocalityConfig.fullName : 'Usme (05)',
            upz: nearest ? nearest.upz : (localidad === 'usme' ? 'UPZ 57 - Gran Yomasa' : (localidad === 'ruu' ? 'UPZ 39 - Quiroga' : 'UPZ General')),
            baselineCrime: nearest ? nearest.baselineCrime : 'Medio',
            coordinates: [[latlng.lat, latlng.lng]],
            lightingType: 'Sodio',
            watts: 100,
            weather: 'seco',
            visibility: 2,
            guardianCai: false,
            guardianRuta: false
        };

        // Add to segment state
        setSegments(prev => ({
            ...prev,
            [auditId]: customSeg
        }));

        // Clear active route selection (if any) to focus on audited point details
        setGeneratedRoutes([]);
        setActiveRouteId(null);

        // Select the custom segment
        setSelectedSegmentId(auditId);
        setSimulationState({
            weather: 'seco',
            lightingType: 'Sodio',
            watts: 100,
            visibility: 2,
            guardianCai: false,
            guardianRuta: false,
            showConstruction: true,
            trafficJams: false,
            accidents: false
        });
    };

    // 10. Handle origin/destination selection from map crosshairs
    const handleLocationSelect = (latlng, mode) => {
        const activeMode = mode || selectingLocationMode;
        if (!activeMode) return;
        
        setSelectingLocationMode(null);

        if (activeMode === 'report') {
            setReportingCoords([latlng.lat, latlng.lng]);
            setIsSelectingCoords(false);
            return;
        }

        setRoutePoints(prev => ({
            ...prev,
            [activeMode]: { lat: latlng.lat, lng: latlng.lng }
        }));

        const formattedCoord = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        if (activeMode === 'origin') {
            setOriginInput(formattedCoord);
        } else {
            setDestInput(formattedCoord);
        }
    };

    // 10b. Handle origin/destination selection from geocoding autocomplete or GPS
    const handleSelectOriginLocation = (coords, name) => {
        setRoutePoints(prev => ({
            ...prev,
            origin: coords
        }));
        if (name !== undefined) {
            setOriginInput(name);
        }
    };

    const handleSelectDestLocation = (coords, name) => {
        setRoutePoints(prev => ({
            ...prev,
            destination: coords
        }));
        if (name !== undefined) {
            setDestInput(name);
        }
    };

    // 10c. Citizen Science Report Handlers
    const handleSetSelectingCoords = (val) => {
        setIsSelectingCoords(val);
        if (val) {
            setSelectingLocationMode('report');
        } else {
            if (selectingLocationMode === 'report') {
                setSelectingLocationMode(null);
            }
        }
    };

    const handleSubmitReport = () => {
        if (!reportingCoords) return;

        let updated = false;
        const updatedReports = citizenReports.map(report => {
            if (report.properties.estado === 'activo' && report.properties.tipo_novedad === reportingType) {
                const reportCoords = report.properties.coordenadas;
                const distDeg = Math.sqrt(Math.pow(reportCoords[0] - reportingCoords[0], 2) + Math.pow(reportCoords[1] - reportingCoords[1], 2));
                const distMeters = distDeg * 111000;
                
                if (distMeters <= 50) {
                    updated = true;
                    return {
                        ...report,
                        properties: {
                            ...report.properties,
                            numero_votos: report.properties.numero_votos + 1
                        }
                    };
                }
            }
            return report;
        });

        if (updated) {
            setCitizenReports(updatedReports);
            alert("Se detectó un reporte idéntico a menos de 50 metros. Se ha sumado tu respaldo (voto) al reporte existente en lugar de duplicarlo.");
        } else {
            const newReport = {
                type: "Feature",
                id: `report_${Date.now()}`,
                geometry: {
                    type: "Point",
                    coordinates: [reportingCoords[1], reportingCoords[0]]
                },
                properties: {
                    id: `report_${Date.now()}`,
                    coordenadas: [reportingCoords[0], reportingCoords[1]],
                    tipo_novedad: reportingType,
                    fecha_creacion: new Date().toISOString().split('T')[0],
                    numero_votos: 1,
                    estado: 'activo',
                    localidad: localidad === 'usme' ? 'Usme' : 'Rafael Uribe Uribe'
                }
            };
            setCitizenReports(prev => [...prev, newReport]);
            alert("Reporte creado con éxito.");
        }

        setIsReporting(false);
        setReportingCoords(null);
        setIsSelectingCoords(false);
    };

    const handleCancelReport = () => {
        setIsReporting(false);
        setReportingCoords(null);
        setIsSelectingCoords(false);
        if (selectingLocationMode === 'report') {
            setSelectingLocationMode(null);
        }
    };

    const handleZoomToReport = (coords) => {
        setZoomToCoords(coords);
        setTimeout(() => {
            setZoomToCoords(null);
        }, 1000);
    };

    const handleUpvoteReport = (reportId) => {
        setCitizenReports(prev => {
            return prev.map(report => {
                if (report.properties.id === reportId) {
                    return {
                        ...report,
                        properties: {
                            ...report.properties,
                            numero_votos: report.properties.numero_votos + 1
                        }
                    };
                }
                return report;
            });
        });
    };

    // Recalculate routes risk & cost in-place when citizen reports are updated (adds immediate responsiveness)
    useEffect(() => {
        if (generatedRoutes.length > 0) {
            setGeneratedRoutes(prevRoutes => {
                return prevRoutes.map(route => {
                    const riskDetails = calculateRouteAverageRisk(
                        route.coordinates,
                        segments,
                        simulationState,
                        constructionZones,
                        simulationState.showConstruction,
                        citizenReports
                    );
                    const routeCost = calculateRouteCost(
                        route.coordinates,
                        segments,
                        simulationState,
                        constructionZones,
                        simulationState.showConstruction,
                        citizenReports
                    );
                    return {
                        ...route,
                        avgRiskScore: riskDetails.avgScore,
                        maxRiskLevel: riskDetails.maxLevel,
                        cost: routeCost.toFixed(1)
                    };
                });
            });
        }
    }, [citizenReports]);

    // 11. Nominatim Geocoding Fetcher
    const geocodeAddress = async (addressText) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)},+Bogota,+Colombia&format=json&limit=1`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    name: data[0].display_name.split(',')[0]
                };
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
        return null;
    };

    // 12. OSRM Routing Fetcher
    const fetchOSRMAlternatives = async (origin, dest) => {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=true`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.code === 'Ok') {
                return data.routes;
            }
        } catch (error) {
            console.error("OSRM routing service failed:", error);
        }
        return [];
    };

    // 13. Trigger route plotting calculations
    const handleCalculateRoute = async () => {
        if (!originInput.trim() || !destInput.trim()) {
            alert("Por favor, ingresa origen y destino (escribiendo o haciendo clic en el mapa).");
            return;
        }

        setIsLoading(true);
        setSelectedSegmentId(null); // Deselect segment when plotting a route
        const coordRegex = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/;

        let originCoord = routePoints.origin;
        if (!originCoord) {
            const originMatch = originInput.match(coordRegex);
            if (originMatch) {
                originCoord = { lat: parseFloat(originMatch[1]), lng: parseFloat(originMatch[2]) };
            } else {
                const result = await geocodeAddress(originInput);
                if (result) {
                    originCoord = { lat: result.lat, lng: result.lng };
                    setOriginInput(result.name);
                } else {
                    alert(`No se pudo encontrar la ubicación de origen: "${originInput}"`);
                    setIsLoading(false);
                    return;
                }
            }
        }

        let destCoord = routePoints.destination;
        if (!destCoord) {
            const destMatch = destInput.match(coordRegex);
            if (destMatch) {
                destCoord = { lat: parseFloat(destMatch[1]), lng: parseFloat(destMatch[2]) };
            } else {
                const result = await geocodeAddress(destInput);
                if (result) {
                    destCoord = { lat: result.lat, lng: result.lng };
                    setDestInput(result.name);
                } else {
                    alert(`No se pudo encontrar la ubicación de destino: "${destInput}"`);
                    setIsLoading(false);
                    return;
                }
            }
        }

        setRoutePoints({ origin: originCoord, destination: destCoord });

        // Fetch OSRM routes
        const routesData = await fetchOSRMAlternatives(originCoord, destCoord);
        if (routesData.length === 0) {
            alert("No se pudieron encontrar rutas para los puntos ingresados.");
            setIsLoading(false);
            return;
        }

        const calculated = routesData.map((route, idx) => {
            const leafletCoords = route.geometry.coordinates.map(pt => [pt[1], pt[0]]);
            const riskDetails = calculateRouteAverageRisk(
                leafletCoords, 
                segments, 
                simulationState, 
                constructionZones, 
                simulationState.showConstruction,
                citizenReports
            );
            const routeCost = calculateRouteCost(
                leafletCoords,
                segments,
                simulationState,
                constructionZones,
                simulationState.showConstruction,
                citizenReports
            );

            // Detect traffic jams on this route
            const jamsOnRoute = detectTrafficJamsOnRoute(leafletCoords, trafficJams);
            const totalDelayMinutes = jamsOnRoute.reduce((sum, j) => sum + j.delayMinutes, 0);
            const baseDurationMin = Math.round(route.duration / 60);
            
            return {
                id: `route_${idx}`,
                name: `Ruta ${idx + 1}`,
                distanceKm: (route.distance / 1000).toFixed(1),
                durationMin: String(baseDurationMin),
                durationWithTraffic: String(baseDurationMin + totalDelayMinutes),
                coordinates: leafletCoords,
                avgRiskScore: riskDetails.avgScore,
                maxRiskLevel: riskDetails.maxLevel,
                trafficJamsOnRoute: jamsOnRoute,
                totalDelayMinutes: totalDelayMinutes,
                cost: routeCost.toFixed(1)
            };
        });

        setGeneratedRoutes(calculated);
        setActiveRouteId('route_0');
        setIsLoading(false);
    };

    // 14. Clear route overlays
    const handleClearRoute = () => {
        setGeneratedRoutes([]);
        setActiveRouteId(null);
        setRoutePoints({ origin: null, destination: null });
        setDestInput('');
        setOriginInput(localidad === 'usme' ? 'Portal Usme' : 'Molinos');
        setSelectedSegmentId(null);
    };

    // 15. Calculate active predictions and CPTED recommendations
    let currentPrediction = { score: '2.4', level: 'Bajo', shaps: {} };
    let recommendations = [];

    const activeRoute = generatedRoutes.find(r => r.id === activeRouteId);

    if (activeRoute) {
        // Evaluate active route risk
        const riskLevel = activeRoute.avgRiskScore >= 7.0 ? 'Alto' : (activeRoute.avgRiskScore >= 3.8 ? 'Medio' : 'Bajo');
        
        let routeConstructionImpact = 0;
        if (simulationState.showConstruction) {
            const hasConstructionOnRoute = constructionZones.some(zone => {
                return activeRoute.coordinates.some(pt => {
                    const distDeg = Math.sqrt(Math.pow(pt[0] - zone.lat, 2) + Math.pow(pt[1] - zone.lng, 2));
                    return (distDeg * 111000) <= zone.radius;
                });
            });
            if (hasConstructionOnRoute) {
                routeConstructionImpact = 1.8;
            }
        }

        let routeCitizenImpact = 0;
        const step = Math.max(1, Math.floor(activeRoute.coordinates.length / 20));
        let count = 0;
        for (let i = 0; i < activeRoute.coordinates.length; i += step) {
            const pt = activeRoute.coordinates[i];
            const nearest = findNearestSegment({ lat: pt[0], lng: pt[1] }, segments);
            if (nearest) {
                routeCitizenImpact += calcularRiesgoCiudadano(nearest.id, citizenReports, segments);
            }
            count++;
        }
        routeCitizenImpact = parseFloat((routeCitizenImpact / count).toFixed(2));

        currentPrediction = {
            score: activeRoute.avgRiskScore,
            level: riskLevel,
            shaps: {
                'Iluminación': simulationState.lightingType === 'Sodio' ? 0.7 : -0.8,
                'Potencia Luz': 0.4 - ((simulationState.watts - 50) / 200) * 1.1,
                'Clima IDIGER': simulationState.weather === 'lluvia' ? 1.4 : -0.3,
                'Visibilidad CPTED': simulationState.visibility === 1 ? 0.9 : (simulationState.visibility === 3 ? -1.0 : 0.0),
                'Guardianes CAI/Ruta': (simulationState.guardianCai ? -1.3 : 0.0) + (simulationState.guardianRuta ? -0.9 : 0.0),
                'Frente Obra (IDU)': routeConstructionImpact,
                'Trancones (Waze)': simulationState.trafficJams ? 0.7 : -0.2,
                'Accidentes (CRUE)': simulationState.accidents ? 1.5 : 0.0,
                'Riesgo Ciudadano': routeCitizenImpact
            }
        };
        recommendations = getRouteRecommendations(activeRoute, simulationState, generatedRoutes, constructionZones, simulationState.showConstruction);
    } else if (selectedSegmentId && segments[selectedSegmentId]) {
        // Evaluate segment risk
        const segment = segments[selectedSegmentId];
        currentPrediction = calculateRisk(segment, constructionZones, simulationState.showConstruction, citizenReports, segments);
        recommendations = getRecommendations(segment, currentPrediction, simulationState);
    }

    return (
        <DashboardLayout
            viewMode={viewMode}
            header={
                <FloatingHeader
                    localidad={localidad}
                    onLocalidadChange={handleLocalidadChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            }
            mapComponent={
                <MapComponent
                    localidad={localidad}
                    onLocalidadChange={handleLocalidadChange}
                    selectedSegmentId={selectedSegmentId}
                    onSelectSegment={handleSelectSegment}
                    onMapAuditClick={handleMapAuditClick}
                    routePoints={routePoints}
                    selectingLocationMode={selectingLocationMode}
                    onLocationSelect={handleLocationSelect}
                    generatedRoutes={generatedRoutes}
                    activeRouteId={activeRouteId}
                    onSelectRoute={setActiveRouteId}
                    simulationState={simulationState}
                    bikeSegments={segments}
                    constructionZones={constructionZones}
                    showConstruction={simulationState.showConstruction}
                    mapLayers={mapLayers}
                    trafficJams={trafficJams}
                    citizenReports={citizenReports}
                    onUpvoteReport={handleUpvoteReport}
                    zoomToCoords={zoomToCoords}
                />
            }
            routePlanner={
                <RoutePlanner
                    originInput={originInput}
                    onOriginInputChange={setOriginInput}
                    destInput={destInput}
                    onDestInputChange={setDestInput}
                    selectingLocationMode={selectingLocationMode}
                    onSelectLocationModeChange={setSelectingLocationMode}
                    onCalculateRoute={handleCalculateRoute}
                    onClearRoute={handleClearRoute}
                    hasRoute={generatedRoutes.length > 0}
                    isLoading={isLoading}
                    onSelectOriginLocation={handleSelectOriginLocation}
                    onSelectDestLocation={handleSelectDestLocation}
                    mapLayers={mapLayers}
                    onMapLayersChange={setMapLayers}
                />
            }
            simulatorPanel={
                <SimulatorPanel
                    selectedSegment={selectedSegmentId ? segments[selectedSegmentId] : null}
                    simulationState={simulationState}
                    onSimulationStateChange={handleSimulationStateChange}
                    viewMode={viewMode}
                />
            }
            resultsPanel={
                <ResultsPanel
                    prediction={currentPrediction}
                    hasRoute={generatedRoutes.length > 0}
                    generatedRoutes={generatedRoutes}
                    activeRouteId={activeRouteId}
                    onSelectRoute={setActiveRouteId}
                    recommendations={recommendations}
                    viewMode={viewMode}
                    trafficJamsOnRoute={activeRoute ? activeRoute.trafficJamsOnRoute : []}
                    totalDelayMinutes={activeRoute ? activeRoute.totalDelayMinutes : 0}
                />
            }
            statsPanel={
                <StatsPanel
                    shaps={currentPrediction.shaps}
                />
            }
            citizenSciencePanel={
                <CitizenSciencePanel
                    citizenReports={citizenReports}
                    localidad={localidad}
                    isReporting={isReporting}
                    setIsReporting={setIsReporting}
                    reportingType={reportingType}
                    setReportingType={setReportingType}
                    reportingCoords={reportingCoords}
                    isSelectingCoords={isSelectingCoords}
                    setIsSelectingCoords={handleSetSelectingCoords}
                    onSubmitReport={handleSubmitReport}
                    onCancelReport={handleCancelReport}
                    onZoomToReport={handleZoomToReport}
                />
            }
        />
    );
}
