import React, { useState, useEffect } from 'react';
import FloatingHeader from '../organisms/FloatingHeader';
import RoutePlanner from '../organisms/RoutePlanner';
import SimulatorPanel from '../organisms/SimulatorPanel';
import ResultsPanel from '../organisms/ResultsPanel';
import StatsPanel from '../organisms/StatsPanel';
import MapComponent from '../organisms/MapComponent';
import DashboardLayout from '../templates/DashboardLayout';

import { bikeSegments as initialSegments } from '../../data/bikeSegments';
import { 
    calculateRisk, 
    getRecommendations, 
    getRouteRecommendations, 
    findNearestSegment,
    calculateRouteAverageRisk
} from '../../utils/riskCalculator';

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
        guardianRuta: false
    });

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
                guardianRuta: segment.guardianRuta || false
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
        const customSeg = {
            id: auditId,
            name: `Calle Auditada (Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)})`,
            localidad: localidad === 'usme' ? 'Usme (05)' : 'Rafael Uribe Uribe (18)',
            upz: nearest ? nearest.upz : (localidad === 'usme' ? 'UPZ 57 - Gran Yomasa' : 'UPZ 39 - Quiroga'),
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
            guardianRuta: false
        });
    };

    // 10. Handle origin/destination selection from map crosshairs
    const handleLocationSelect = (latlng, mode) => {
        const activeMode = mode || selectingLocationMode;
        if (!activeMode) return;
        
        setSelectingLocationMode(null);

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

        let originCoord = null;
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

        let destCoord = null;
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
            const riskDetails = calculateRouteAverageRisk(leafletCoords, segments, simulationState);
            
            return {
                id: `route_${idx}`,
                name: `Ruta ${idx + 1}`,
                distanceKm: (route.distance / 1000).toFixed(1),
                durationMin: (route.duration / 60).toFixed(0),
                coordinates: leafletCoords,
                avgRiskScore: riskDetails.avgScore,
                maxRiskLevel: riskDetails.maxLevel
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
        currentPrediction = {
            score: activeRoute.avgRiskScore,
            level: riskLevel,
            shaps: {
                // Route level shaps can be approximated or aggregated. We display default state or simulation inputs impact.
                'Iluminación': simulationState.lightingType === 'Sodio' ? 0.7 : -0.8,
                'Potencia Luz': 0.4 - ((simulationState.watts - 50) / 200) * 1.1,
                'Clima IDIGER': simulationState.weather === 'lluvia' ? 1.4 : -0.3,
                'Visibilidad CPTED': simulationState.visibility === 1 ? 0.9 : (simulationState.visibility === 3 ? -1.0 : 0.0),
                'Guardianes CAI/Ruta': (simulationState.guardianCai ? -1.3 : 0.0) + (simulationState.guardianRuta ? -0.9 : 0.0)
            }
        };
        recommendations = getRouteRecommendations(activeRoute, simulationState, generatedRoutes);
    } else if (selectedSegmentId && segments[selectedSegmentId]) {
        // Evaluate segment risk
        const segment = segments[selectedSegmentId];
        currentPrediction = calculateRisk(segment);
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
                />
            }
            statsPanel={
                <StatsPanel
                    shaps={currentPrediction.shaps}
                />
            }
        />
    );
}
