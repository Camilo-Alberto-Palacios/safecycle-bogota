import React, { useState, useEffect } from 'react';
import FloatingHeader from './components/organisms/FloatingHeader';
import RoutePlanner from './components/organisms/RoutePlanner';
import SimulatorPanel from './components/organisms/SimulatorPanel';
import ResultsPanel from './components/organisms/ResultsPanel';
import StatsPanel from './components/organisms/StatsPanel';
import MapComponent from './components/organisms/MapComponent';
import CitizenSciencePanel from './components/organisms/CitizenSciencePanel';
import FormField from './components/molecules/FormField';

import { bikeSegments as initialSegments, localitiesMap } from './data/bikeSegments';
import { constructionZones } from './data/constructionZones';
import { trafficJams } from './data/trafficJams';
import { 
    calculateRisk, 
    getRecommendations, 
    getRouteRecommendations, 
    findNearestSegment,
    calculateRouteAverageRisk,
    detectTrafficJamsOnRoute,
    calculateRouteCost,
    calcularRiesgoCiudadano
} from './utils/riskCalculator';

export default function App() {
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

    // Desktop drawer open/close states
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(true);

    // Mobile specific UI state
    const [showScientificMenu, setShowScientificMenu] = useState(false);
    const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState('settings');
    const [isMobile, setIsMobile] = useState(false);

    // Monitor screen width to enable conditional rendering of desktop drawers
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            // Auto expand bottom sheet on mobile when a segment is audited
            setIsBottomSheetExpanded(true);
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
        // Auto expand bottom sheet on mobile for custom audit points
        setIsBottomSheetExpanded(true);
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
            // Close mobile scientific menu modal so user can see the map to select coordinates
            setShowScientificMenu(false);
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

    // Recalculate routes risk & cost in-place when citizen reports are updated
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

        // Mobile Bottom Sheet UX: Expand when routes are plotted
        setIsBottomSheetExpanded(true);
    };

    // 14. Clear route overlays
    const handleClearRoute = () => {
        setGeneratedRoutes([]);
        setActiveRouteId(null);
        setRoutePoints({ origin: null, destination: null });
        setDestInput('');
        setOriginInput(localidad === 'usme' ? 'Portal Usme' : 'Molinos');
        setSelectedSegmentId(null);
        setIsBottomSheetExpanded(false);
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

    // Prepare subcomponents as JSX to render inside layouts
    const headerComponent = (
        <FloatingHeader
            localidad={localidad}
            onLocalidadChange={handleLocalidadChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hideLogo={leftDrawerOpen}
        />
    );

    const mapComponent = (
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
    );

    const routePlannerComponent = (
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
            showBrandLogo={leftDrawerOpen}
            localidad={localidad}
            onLocalidadChange={handleLocalidadChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
        />
    );

    const simulatorPanelComponent = (
        <SimulatorPanel
            selectedSegment={selectedSegmentId ? segments[selectedSegmentId] : null}
            simulationState={simulationState}
            onSimulationStateChange={handleSimulationStateChange}
            viewMode={viewMode}
        />
    );

    const resultsPanelComponent = (
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
    );

    const statsPanelComponent = (
        <StatsPanel
            shaps={currentPrediction.shaps}
        />
    );

    const citizenSciencePanelComponent = (
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
    );

    return (
        <div className={`relative w-screen h-screen overflow-hidden ${viewMode === 'tech' ? 'scientific-view' : 'citizen-view'}`}>
            
            {/* 1. Geospatial Map in Background */}
            <div className="absolute inset-0 z-0">
                {mapComponent}
            </div>

            {/* ==================== MOBILE LAYOUT (h < md) ==================== */}

            {/* 2. Floating Top Planner Card (Google Maps Search Style) */}
            <div className="absolute top-4 left-4 right-4 z-10 md:hidden bg-white/95 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-lg flex flex-col gap-3.5 text-slate-800 max-w-[calc(100vw-2rem)] mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}Logo.svg`} alt="Ruta Clara Logo" className="w-8 h-8" />
                        <h1 className="font-extrabold text-base text-emerald-700">Ruta Clara</h1>
                    </div>
                    {/* Action buttons next to each other */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setActiveModalTab('simulator');
                                setShowScientificMenu(true);
                            }} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 cursor-pointer"
                            style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                            title="Simulador predictivo"
                            aria-label="Abrir Simulador"
                        >
                            <i className="fa-solid fa-sliders text-md"></i>
                        </button>
                        <button 
                            onClick={() => {
                                setActiveModalTab('settings');
                                setShowScientificMenu(true);
                            }} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 cursor-pointer"
                            style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                            title="Ajustes de mapa y localidad"
                            aria-label="Abrir Ajustes"
                        >
                            <i className="fa-solid fa-gear text-md"></i>
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <FormField
                        value={originInput}
                        onChange={setOriginInput}
                        placeholder="Origen: clic mapa o buscar..."
                        iconClass="fa-solid fa-circle-play text-emerald-600"
                        onSelectOnMap={() => setSelectingLocationMode('origin')}
                        isSelecting={selectingLocationMode === 'origin'}
                        title="Fijar origen en el mapa"
                        onSelectLocation={handleSelectOriginLocation}
                        showGpsButton={true}
                    />
                    <FormField
                        value={destInput}
                        onChange={setDestInput}
                        placeholder="Destino: clic mapa o buscar..."
                        iconClass="fa-solid fa-location-dot text-red-500"
                        onSelectOnMap={() => setSelectingLocationMode('destination')}
                        isSelecting={selectingLocationMode === 'destination'}
                        title="Fijar destino en el mapa"
                        onSelectLocation={handleSelectDestLocation}
                        showGpsButton={false}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCalculateRoute}
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i> Procesando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-compass"></i> Calcular Ruta
                            </>
                        )}
                    </button>
                    {generatedRoutes.length > 0 && (
                        <button
                            onClick={handleClearRoute}
                            className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-650 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <i className="fa-solid fa-trash-can"></i> Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Mobile Scientific / Simulation Menu (Modal Panel with Tabs) */}
            {showScientificMenu && (
                <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-md overflow-y-auto p-6 md:hidden text-slate-800 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <i className="fa-solid fa-circle-info text-emerald-600"></i> Panel de Configuración
                        </h2>
                        <button 
                            onClick={() => setShowScientificMenu(false)}
                            className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all text-slate-700 cursor-pointer"
                            title="Cerrar"
                            aria-label="Cerrar Configuración"
                        >
                            <i className="fa-solid fa-xmark text-md"></i>
                        </button>
                    </div>

                    {/* Tab Navigation Switcher inside Modal */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 border border-slate-200/85 rounded-xl">
                        <button
                            onClick={() => setActiveModalTab('settings')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeModalTab === 'settings' 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'text-slate-650 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                        >
                            <i className="fa-solid fa-gear"></i> Ajustes de Mapa
                        </button>
                        <button
                            onClick={() => setActiveModalTab('simulator')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeModalTab === 'simulator' 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                        >
                            <i className="fa-solid fa-sliders"></i> Simulador y Reportes
                        </button>
                    </div>

                    {/* Tab 1: Settings */}
                    {activeModalTab === 'settings' && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {/* Localidad Switcher */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Localidad Activa</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 border border-slate-200/80 rounded-xl">
                                    {Object.keys(localitiesMap).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                handleLocalidadChange(key);
                                                setShowScientificMenu(false); // Close menu to show map flying
                                            }}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                localidad === key 
                                                    ? 'bg-emerald-650 text-white shadow-sm' 
                                                    : 'text-slate-600 hover:text-slate-800'
                                            }`}
                                        >
                                            {localitiesMap[key].name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* View Mode Switcher */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Perfil de Vista</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 border border-slate-200/80 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('citizen')}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            viewMode === 'citizen' 
                                                ? 'bg-emerald-650 text-white shadow-sm' 
                                                : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                    >
                                        Ciudadano
                                    </button>
                                    <button
                                        onClick={() => setViewMode('tech')}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            viewMode === 'tech' 
                                                ? 'bg-emerald-650 text-white shadow-sm' 
                                                : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                    >
                                        Científico
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            {/* Map Layers Checklist */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fa-solid fa-layer-group text-emerald-600"></i> Capas del Mapa
                                </label>
                                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-map text-slate-400 mr-2"></i>Límites de Localidades</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.localities}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, localities: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-shield-halved text-blue-500 mr-2"></i>CAIs de Policía</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.cais}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, cais: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-person-digging text-orange-500 mr-2"></i>Zonas de Obra (IDU)</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.construction}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, construction: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-car-burst text-yellow-600 mr-2"></i>Accidentes Recientes</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.accidents}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, accidents: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-mask text-red-500 mr-2"></i>Robos Últimas 24h</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.robberies}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, robberies: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-car text-orange-500 mr-2"></i>Trancones en Tiempo Real</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.trafficJams}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, trafficJams: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-slate-700 font-medium"><i className="fa-solid fa-people-group text-emerald-600 mr-2"></i>Reportes Ciudadanos</span>
                                        <input
                                            type="checkbox"
                                            checked={mapLayers.citizenReports}
                                            onChange={(e) => setMapLayers(prev => ({ ...prev, citizenReports: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Simulator & Reports */}
                    {activeModalTab === 'simulator' && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {/* Simulator Sliders */}
                            {simulatorPanelComponent}
                            <div className="border-t border-slate-200 my-1"></div>
                            {/* Citizen Science Panel */}
                            {citizenSciencePanelComponent}
                        </div>
                    )}
                </div>
            )}

            {/* 4. Mobile Bottom Sheet for Results */}
            {(generatedRoutes.length > 0 || selectedSegmentId) && (
                <div 
                    className={`fixed bottom-0 left-4 right-4 z-40 md:hidden bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800 rounded-t-3xl shadow-2xl transition-all duration-300 ease-in-out flex flex-col max-w-[calc(100vw-2rem)] mx-auto ${
                        isBottomSheetExpanded ? 'h-[55vh]' : 'h-16'
                    }`}
                >
                    {/* Handle Bar (Drag Trigger) */}
                    <div 
                        onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                        className="flex flex-col items-center justify-center py-2 h-16 cursor-pointer select-none active:bg-slate-100 rounded-t-3xl border-b border-slate-100"
                    >
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1"></div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>
                                {generatedRoutes.length > 0 
                                    ? `${generatedRoutes.length} Ruta(s) calculada(s)`
                                    : selectedSegmentId === 'custom_audit'
                                        ? 'Calle Auditada Seleccionada'
                                        : 'Tramo Seleccionado'}
                            </span>
                            <i className={`fa-solid ${isBottomSheetExpanded ? 'fa-chevron-down' : 'fa-chevron-up'} text-[10px] text-slate-500`}></i>
                        </div>
                        {/* Quick summary line when collapsed */}
                        {!isBottomSheetExpanded && activeRoute && (
                            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                {activeRoute.name} - {activeRoute.distanceKm} km - {activeRoute.durationMin} min - Riesgo: {activeRoute.maxRiskLevel}
                            </span>
                        )}
                        {!isBottomSheetExpanded && selectedSegmentId && segments[selectedSegmentId] && (
                            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                {segments[selectedSegmentId].name.slice(0, 35)}... - Riesgo: {currentPrediction.level}
                            </span>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 pb-6 text-slate-850">
                        {resultsPanelComponent}
                        {viewMode === 'tech' && (
                            <div className="mt-4 border-t border-slate-200 pt-4">
                                {statsPanelComponent}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* ==================== DESKTOP LAYOUT (md: relative flex-row) ==================== */}

            {/* 5. Desktop Floating Header (Centered at the top) */}
            {!isMobile && !leftDrawerOpen && (
                <div className="hidden md:block">
                    {headerComponent}
                </div>
            )}

            {/* 6. Desktop Left Drawer (Planner, Simulator & Reports) */}
            {!isMobile && (
                <div className={`floating-drawer left-drawer ${leftDrawerOpen ? 'open' : 'closed'} hidden md:flex`}>
                    <div className="drawer-content scrollable">
                        {routePlannerComponent}
                        <div className="drawer-divider"></div>
                        {simulatorPanelComponent}
                        {citizenSciencePanelComponent && (
                            <>
                                <div className="drawer-divider"></div>
                                {citizenSciencePanelComponent}
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
                        className="drawer-toggle-btn left-toggle"
                        title={leftDrawerOpen ? "Contraer Panel" : "Expandir Panel"}
                        aria-label="Contraer Panel Izquierdo"
                    >
                        <i className={`fa-solid ${leftDrawerOpen ? 'fa-chevron-left' : 'fa-sliders'}`}></i>
                    </button>
                </div>
            )}

            {/* 7. Desktop Right Drawer (Results, Recommendations & SHAP weights) */}
            {!isMobile && (
                <div className={`floating-drawer right-drawer ${rightDrawerOpen ? 'open' : 'closed'} hidden md:flex`}>
                    <div className="drawer-content scrollable">
                        {viewMode === 'tech' && statsPanelComponent}
                        {viewMode === 'tech' && <div className="drawer-divider"></div>}
                        {resultsPanelComponent}
                    </div>
                    <button 
                        onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
                        className="drawer-toggle-btn right-toggle"
                        title={rightDrawerOpen ? "Contraer Panel" : "Expandir Resultados"}
                        aria-label="Contraer Panel Derecho"
                    >
                        <i className={`fa-solid ${rightDrawerOpen ? 'fa-chevron-right' : 'fa-chart-simple'}`}></i>
                    </button>
                </div>
            )}

            {/* 8. Desktop Floating Footer (Bottom centered) */}
            {!isMobile && (
                <footer className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-slate-500 text-center bg-white/80 py-1.5 px-4 rounded-full border border-slate-200/50 backdrop-blur shadow-sm">
                    <p><strong>Ruta Clara v1.0.0 (MVP)</strong> • Semillero Construcción de software para la transformación del territorio</p>
                </footer>
            )}    </div>
    );
}
