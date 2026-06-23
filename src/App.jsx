import React, { useState, useEffect } from 'react';
import FloatingHeader from './components/organisms/FloatingHeader';
import RoutePlanner from './components/organisms/RoutePlanner';
import SimulatorPanel from './components/organisms/SimulatorPanel';
import ResultsPanel from './components/organisms/ResultsPanel';
import StatsPanel from './components/organisms/StatsPanel';
import MapComponent from './components/organisms/MapComponent';
import CitizenSciencePanel from './components/organisms/CitizenSciencePanel';
import TrafficLightsPanel from './components/organisms/TrafficLightsPanel';
import FormField from './components/molecules/FormField';

import { bikeSegments as initialSegments, localitiesMap } from './data/bikeSegments';
import { constructionZones } from './data/constructionZones';
import { trafficJams } from './data/trafficJams';
import { trafficLights as initialTrafficLights } from './data/trafficLights';
import { 
    calculateRisk, 
    getRecommendations, 
    getRouteRecommendations, 
    findNearestSegment,
    calculateRouteAverageRisk,
    detectTrafficJamsOnRoute,
    calculateRouteCost,
    calcularRiesgoCiudadano,
    evaluateCoordinateRisk
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
        citizenReports: true,
        trafficLights: true
    });

    // Sidebar active tab (desktop left panel content)
    const [activeTab, setActiveTab] = useState('routes');

    // Traffic Lights State
    const [trafficLights, setTrafficLights] = useState(initialTrafficLights);
    const [autoCycleActive, setAutoCycleActive] = useState(true);
    const [greenWaveActive, setGreenWaveActive] = useState(false);

    // 3D Navigation Simulator State
    const [isNavigating, setIsNavigating] = useState(false);
    const [cyclistCoords, setCyclistCoords] = useState(null);
    const [cyclistIndex, setCyclistIndex] = useState(0);
    const [navSpeedMultiplier, setNavSpeedMultiplier] = useState(1);
    const [navStatus, setNavStatus] = useState('stopped');
    const [speedKmh, setSpeedKmh] = useState(0);
    const [hudRecommendation, setHudRecommendation] = useState('Haz clic en Iniciar para comenzar la navegación simulada.');
    const [nextTrafficLight, setNextTrafficLight] = useState(null);

    // Mobile popover states and bottom sheet active tab
    const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
    const [mobileLocalityOpen, setMobileLocalityOpen] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState('results');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

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

    // Sync body class list for dark mode
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // A. Auto-cycle Traffic Lights
    useEffect(() => {
        if (!autoCycleActive) return;
        
        const interval = setInterval(() => {
            setTrafficLights(prev => prev.map(light => {
                // If green wave is active for this light, keep it green!
                if (greenWaveActive && activeRouteId) {
                    const activeRoute = generatedRoutes.find(r => r.id === activeRouteId);
                    if (activeRoute) {
                        const onRoute = activeRoute.coordinates.some(pt => {
                            const distDeg = Math.sqrt(
                                Math.pow(pt[0] - light.coordinates[0], 2) + 
                                Math.pow(pt[1] - light.coordinates[1], 2)
                            );
                            return (distDeg * 111000) <= 40;
                        });
                        if (onRoute) {
                            return { ...light, state: 'verde' };
                        }
                    }
                }

                // Cycle: verde (5s) -> amarillo (5s) -> rojo (5s) -> verde
                let nextState = light.state;
                if (light.state === 'verde') nextState = 'amarillo';
                else if (light.state === 'amarillo') nextState = 'rojo';
                else nextState = 'verde';
                
                return { ...light, state: nextState };
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, [autoCycleActive, greenWaveActive, activeRouteId, generatedRoutes]);

    // B. Force Green Wave handler
    const handleForceGreenWave = () => {
        const activeRoute = generatedRoutes.find(r => r.id === activeRouteId);
        if (!activeRoute) return;
        
        setGreenWaveActive(true);
        setTrafficLights(prev => prev.map(light => {
            const onRoute = activeRoute.coordinates.some(pt => {
                const distDeg = Math.sqrt(
                    Math.pow(pt[0] - light.coordinates[0], 2) + 
                    Math.pow(pt[1] - light.coordinates[1], 2)
                );
                return (distDeg * 111000) <= 40;
            });
            if (onRoute) {
                return { ...light, state: 'verde' };
            }
            return light;
        }));

        setTimeout(() => {
            setGreenWaveActive(false);
        }, 15000);
    };

    // C. Manual traffic light state override
    const handleToggleLightState = (id, newState) => {
        setTrafficLights(prev => prev.map(light => {
            if (light.id === id) {
                return { ...light, state: newState };
            }
            return light;
        }));
    };

    // D. 3D First Person Navigation Simulation loop
    useEffect(() => {
        const activeRoute = generatedRoutes.find(r => r.id === activeRouteId);
        if (navStatus !== 'running' || !activeRoute) return;

        let waitTicks = 0;

        const interval = setInterval(() => {
            const coords = activeRoute.coordinates;
            if (cyclistIndex >= coords.length - 1) {
                // Simulation ended successfully
                setNavStatus('stopped');
                setIsNavigating(false);
                setCyclistCoords(null);
                setCyclistIndex(0);
                setSpeedKmh(0);
                setNextTrafficLight(null);
                alert("¡Has llegado a tu destino de forma segura!");
                return;
            }

            const currentPt = coords[cyclistIndex];

            // Detect next traffic light
            const nearbyLight = trafficLights.find(light => {
                const distDeg = Math.sqrt(
                    Math.pow(currentPt[0] - light.coordinates[0], 2) + 
                    Math.pow(currentPt[1] - light.coordinates[1], 2)
                );
                return (distDeg * 111000) <= 40;
            });

            if (nearbyLight) {
                setNextTrafficLight(nearbyLight);
                if (nearbyLight.state === 'rojo') {
                    setSpeedKmh(0);
                    setHudRecommendation('🚦 Semáforo en ROJO. Detente y espera el cambio a verde.');
                    waitTicks++;
                    if (waitTicks < 4) {
                        return; // pause cyclist progression
                    }
                }
            } else {
                setNextTrafficLight(null);
            }

            waitTicks = 0;

            const nextIdx = cyclistIndex + 1;
            setCyclistIndex(nextIdx);
            setCyclistCoords(coords[nextIdx]);

            // Simulate speed
            const baseSpeed = 18;
            const variance = Math.sin(nextIdx) * 3;
            setSpeedKmh(Math.round(baseSpeed + variance));

            // Dynamic recommendation based on location risk and objects
            const riskInfo = evaluateCoordinateRisk(
                coords[nextIdx][0], 
                coords[nextIdx][1], 
                segments, 
                simulationState, 
                constructionZones, 
                simulationState.showConstruction,
                citizenReports
            );

            // Check proximity to construction zones
            const hasConst = constructionZones.some(zone => {
                const distDeg = Math.sqrt(Math.pow(coords[nextIdx][0] - zone.lat, 2) + Math.pow(coords[nextIdx][1] - zone.lng, 2));
                return (distDeg * 111000) <= zone.radius;
            });

            if (hasConst) {
                setHudRecommendation('🚧 Obras viales del IDU adelante. Disminuye la velocidad.');
            } else if (riskInfo.level === 'Alto') {
                setHudRecommendation('⚠️ Sector con alto índice de hurto. Evita detenerte y mantente en alerta.');
            } else if (simulationState.weather === 'lluvia') {
                setHudRecommendation('🌧️ Calzada resbaladiza por lluvias. Conduce con precaución.');
            } else if (nearbyLight && nearbyLight.state === 'verde') {
                setHudRecommendation('🟢 Cruce semaforizado en VERDE. Paso libre.');
            } else {
                setHudRecommendation('🚴 Calzada despejada. Sigue el rumbo por la ciclorruta.');
            }

        }, 400 / navSpeedMultiplier);

        return () => clearInterval(interval);
    }, [navStatus, cyclistIndex, activeRouteId, navSpeedMultiplier, trafficLights, segments, simulationState, constructionZones, citizenReports]);

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

        if (isMobile) {
            setIsMobileSearchOpen(true);
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
            darkMode={darkMode}
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
            trafficLights={trafficLights}
            isNavigating={isNavigating}
            cyclistCoords={cyclistCoords}
            cyclistIndex={cyclistIndex}
            activeRoute={activeRoute}
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

    const trafficLightsPanelComponent = (
        <TrafficLightsPanel 
            trafficLights={trafficLights}
            localidad={localidad}
            activeRoute={activeRoute}
            onToggleAutoCycle={() => setAutoCycleActive(!autoCycleActive)}
            autoCycleActive={autoCycleActive}
            onForceGreenWave={handleForceGreenWave}
            greenWaveActive={greenWaveActive}
            onToggleLightState={handleToggleLightState}
        />
    );

    const navigationControlsComponent = (
        <div className="navigation-controls-card animate-fade-in">
            <h3>
                <i className="fa-solid fa-bicycle text-accent"></i> Simulación Navegación 3D
            </h3>
            <p className="navigation-desc">
                Recorre la ruta en primera persona. El mapa se inclinará y girará según el rumbo del trayecto.
            </p>

            {!activeRoute ? (
                <div className="nav-warning-box">
                    <i className="fa-solid fa-triangle-exclamation"></i> Para iniciar la simulación 3D, primero debes calcular una ruta en la pestaña de <strong>Rutas</strong>.
                </div>
            ) : (
                <div className="nav-active-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="nav-status-banner">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ruta Activa:</span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{activeRoute.name} ({activeRoute.distanceKm} km)</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            Progreso: {Math.round((cyclistIndex / (activeRoute.coordinates.length - 1)) * 100)}% ({cyclistIndex} / {activeRoute.coordinates.length - 1} pts)
                        </span>
                    </div>

                    <div className="nav-buttons-row" style={{ display: 'flex', gap: '0.5rem' }}>
                        {navStatus === 'stopped' && (
                            <button
                                className="btn-flat btn-flat-primary"
                                onClick={() => {
                                    setIsNavigating(true);
                                    setNavStatus('running');
                                    setCyclistIndex(0);
                                    setCyclistCoords(activeRoute.coordinates[0]);
                                }}
                                style={{ flex: 1 }}
                            >
                                <i className="fa-solid fa-play"></i> Iniciar
                            </button>
                        )}

                        {navStatus === 'running' && (
                            <button
                                className="btn-flat btn-flat-warning"
                                onClick={() => setNavStatus('paused')}
                                style={{ flex: 1 }}
                            >
                                <i className="fa-solid fa-pause"></i> Pausar
                            </button>
                        )}

                        {navStatus === 'paused' && (
                            <button
                                className="btn-flat btn-flat-primary"
                                onClick={() => setNavStatus('running')}
                                style={{ flex: 1 }}
                            >
                                <i className="fa-solid fa-play"></i> Continuar
                            </button>
                        )}

                        {navStatus !== 'stopped' && (
                            <button
                                className="btn-flat btn-flat-danger"
                                onClick={() => {
                                    setNavStatus('stopped');
                                    setIsNavigating(false);
                                    setCyclistCoords(null);
                                    setCyclistIndex(0);
                                    setSpeedKmh(0);
                                    setNextTrafficLight(null);
                                }}
                                style={{ flex: 1 }}
                            >
                                <i className="fa-solid fa-square"></i> Detener
                            </button>
                        )}
                    </div>

                    <div className="speed-multiplier-control">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                            Velocidad de Simulación:
                        </label>
                        <div className="speed-multiplier-track">
                            {[1, 2, 5].map(mult => (
                                <button
                                    key={mult}
                                    onClick={() => setNavSpeedMultiplier(mult)}
                                    style={{
                                        flex: 1,
                                        padding: '0.25rem',
                                        borderRadius: '6px',
                                        background: navSpeedMultiplier === mult ? 'var(--accent-color, #6366f1)' : 'transparent',
                                        color: navSpeedMultiplier === mult ? '#fff' : 'var(--text-secondary)',
                                        border: 'none',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {mult}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const cockpitHUD = isNavigating && activeRoute && (
        <div className="cockpit-hud-overlay animate-slide-up">
            <div className="hud-header">
                <div className="hud-stat-box">
                    <span className="hud-stat-label">VELOCIDAD</span>
                    <span className="hud-stat-value">{speedKmh} <span className="hud-unit">km/h</span></span>
                </div>
                
                <div className="hud-stat-box">
                    <span className="hud-stat-label">DISTANCIA</span>
                    <span className="hud-stat-value">
                        {activeRoute.distanceKm} <span className="hud-unit">km</span>
                    </span>
                </div>

                <div className="hud-stat-box">
                    <span className="hud-stat-label">INTERSECCIÓN</span>
                    {nextTrafficLight ? (
                        <span className="hud-stat-value" style={{ 
                            color: nextTrafficLight.state === 'verde' ? '#10b981' : (nextTrafficLight.state === 'amarillo' ? '#eab308' : '#ef4444'),
                            textShadow: nextTrafficLight.state === 'verde' ? '0 0 10px rgba(16,185,129,0.5)' : (nextTrafficLight.state === 'amarillo' ? '0 0 10px rgba(234,179,8,0.5)' : '0 0 10px rgba(239,68,68,0.5)')
                        }}>
                            <i className="fa-solid fa-traffic-light"></i> {nextTrafficLight.state.toUpperCase()}
                        </span>
                    ) : (
                        <span className="hud-stat-value text-muted">-</span>
                    )}
                </div>
            </div>

            <div className="hud-recommendation-banner">
                <p className="hud-rec-text">{hudRecommendation}</p>
            </div>

            <div className="hud-handlebar-cockpit">
                <div className="handlebar-left"></div>
                <div className="handlebar-center">
                    <div className="bike-computer">
                        <div className="computer-screen">
                            <span className="battery-icon"><i className="fa-solid fa-battery-three-quarters"></i> 87%</span>
                            <span className="time-display">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
                <div className="handlebar-right"></div>
            </div>

            <button 
                className="hud-exit-btn"
                onClick={() => {
                    setNavStatus('stopped');
                    setIsNavigating(false);
                    setCyclistCoords(null);
                    setCyclistIndex(0);
                    setSpeedKmh(0);
                    setNextTrafficLight(null);
                }}
                title="Salir de la navegación"
            >
                <i className="fa-solid fa-xmark"></i> Salir
            </button>
        </div>
    );

    return (
        <div className={`relative w-screen h-screen overflow-hidden ${viewMode === 'tech' ? 'scientific-view' : 'citizen-view'}`}>
            
            {/* 1. Geospatial Map in Background */}
            <div className="absolute inset-0 z-0">
                {mapComponent}
            </div>

            {/* ==================== MOBILE LAYOUT (h < md) ==================== */}

            {/* 2. Floating Top Planner Card - hidden during navigation */}
            {isMobile && !isNavigating && !generatedRoutes.length && (
                <div 
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="absolute top-4 left-4 right-4 z-10 backdrop-blur-md p-3.5 rounded-2xl shadow-lg flex items-center gap-3 max-w-[calc(100vw-2rem)] mx-auto cursor-pointer transition-all"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        color: 'var(--text-on-surface)'
                    }}
                >
                    <i className="fa-solid fa-magnifying-glass text-emerald-600 text-base"></i>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>¿A dónde quieres ir hoy? (Planificar ruta)</span>
                </div>
            )}

            {isMobile && !isNavigating && generatedRoutes.length > 0 && (
                <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-2xl shadow-lg flex items-center justify-between text-slate-800 max-w-[calc(100vw-2rem)] mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <button 
                            onClick={handleClearRoute}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer border-none"
                        >
                            <i className="fa-solid fa-arrow-left text-xs"></i>
                        </button>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Ruta Activa</span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                                {originInput.split(',')[0]} ➔ {destInput.split(',')[0]}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="py-1.5 px-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-2xs cursor-pointer border-none flex-shrink-0"
                    >
                        Editar
                    </button>
                </div>
            )}

            {/* Mobile Search Overlay a Pantalla Completa */}
            {isMobile && isMobileSearchOpen && (
                <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-xl z-50 p-5 flex flex-col text-slate-100 animate-fade-in">
                    <div className="flex items-center gap-3.5 mb-5">
                        <button 
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 cursor-pointer border-none"
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                            <i className="fa-solid fa-route text-emerald-500"></i> Planificar Ciclorruta
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 mb-5">
                        <FormField
                            value={originInput}
                            onChange={setOriginInput}
                            placeholder="Escribe origen o toca el mapa..."
                            iconClass="fa-solid fa-circle-play text-emerald-500"
                            onSelectOnMap={() => {
                                setSelectingLocationMode('origin');
                                setIsMobileSearchOpen(false);
                            }}
                            isSelecting={selectingLocationMode === 'origin'}
                            title="Fijar origen en el mapa"
                            onSelectLocation={handleSelectOriginLocation}
                            showGpsButton={true}
                        />
                        <FormField
                            value={destInput}
                            onChange={setDestInput}
                            placeholder="Escribe destino o toca el mapa..."
                            iconClass="fa-solid fa-location-dot text-rose-500"
                            onSelectOnMap={() => {
                                setSelectingLocationMode('destination');
                                setIsMobileSearchOpen(false);
                            }}
                            isSelecting={selectingLocationMode === 'destination'}
                            title="Fijar destino en el mapa"
                            onSelectLocation={handleSelectDestLocation}
                            showGpsButton={false}
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto flex flex-col gap-2 mb-5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destinos Recomendados</span>
                        {[
                            { name: 'Portal Usme', coords: { lat: 4.5317, lng: -74.1166 } },
                            { name: 'Estación Molinos', coords: { lat: 4.5631, lng: -74.1128 } },
                            { name: 'Parque Metropolitano El Tunal', coords: { lat: 4.5761, lng: -74.1332 } },
                            { name: 'UPZ Quiroga', coords: { lat: 4.5815, lng: -74.1118 } },
                            { name: 'Parque Entre Nubes', coords: { lat: 4.5539, lng: -74.0934 } }
                        ].map((loc, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    handleSelectDestLocation({ lat: loc.coords.lat, lng: loc.coords.lng }, loc.name);
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:bg-slate-800/60 transition-all text-left text-xs font-semibold text-slate-200 cursor-pointer border-none"
                            >
                                <i className="fa-solid fa-location-arrow text-slate-500 text-2xs"></i>
                                <span>{loc.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2.5">
                        <button
                            onClick={() => {
                                handleCalculateRoute();
                                setIsMobileSearchOpen(false);
                            }}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer border-none"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> Trazando...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-compass"></i> Trazar Ruta
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Mobile Floating Action Buttons (FABs) - Consolidated and Clean */}
            {isMobile && !isMobileSearchOpen && (
                <div className="absolute top-20 right-4 z-10 flex flex-col gap-3 md:hidden">
                    {/* GPS Locate Button */}
                    <button 
                        onClick={() => {
                            const activeLocConfig = localitiesMap[localidad];
                            if (activeLocConfig) {
                                setZoomToCoords(activeLocConfig.center);
                                setTimeout(() => setZoomToCoords(null), 1000);
                            }
                        }}
                        className="fab-btn animate-fade-in"
                        title="Centrar Localidad"
                    >
                        <i className="fa-solid fa-crosshairs"></i>
                    </button>

                    {/* Consolidated Options Button */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setMobileLayersOpen(!mobileLayersOpen);
                            }}
                            className={`fab-btn animate-fade-in ${mobileLayersOpen ? 'active' : ''}`}
                            title="Opciones de Mapa"
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </button>
                        {mobileLayersOpen && (
                            <div className="absolute right-12 top-0 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl z-20 w-64 text-slate-800 animate-fade-in flex flex-col gap-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                                    <i className="fa-solid fa-sliders text-emerald-600"></i> Ajustes de Mapa
                                </h4>
                                
                                {/* Localidad switcher inline */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Localidad Activa:</span>
                                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                                        {Object.keys(localitiesMap).map(key => (
                                            <button
                                                key={key}
                                                onClick={() => handleLocalidadChange(key)}
                                                className={`flex-1 py-1 rounded text-2xs font-bold border-none cursor-pointer ${
                                                    localidad === key ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                                                }`}
                                                style={localidad === key ? { background: '#059669', color: '#fff' } : {}}
                                            >
                                                {localitiesMap[key].name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* View Mode Toggle Inline */}
                                <div className="flex justify-between items-center py-1.5 border-t border-slate-100 mt-1">
                                    <span className="text-2xs font-bold text-slate-700">Modo Científico</span>
                                    <input 
                                        type="checkbox" 
                                        checked={viewMode === 'tech'} 
                                        onChange={() => setViewMode(prev => prev === 'citizen' ? 'tech' : 'citizen')}
                                        className="accent-emerald-600 w-4 h-4 cursor-pointer"
                                    />
                                </div>

                                {/* Dark Mode Toggle Inline */}
                                <div className="flex justify-between items-center py-1.5 border-t border-slate-100">
                                    <span className="text-2xs font-bold text-slate-700">Modo Oscuro</span>
                                    <input 
                                        type="checkbox" 
                                        checked={darkMode} 
                                        onChange={() => setDarkMode(!darkMode)}
                                        className="accent-emerald-600 w-4 h-4 cursor-pointer"
                                    />
                                </div>

                                {/* Map Layers List */}
                                <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-450 uppercase">Capas del Mapa:</span>
                                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto text-2xs">
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-750">Límites Localidades</span>
                                            <input type="checkbox" checked={mapLayers.localities} onChange={e => setMapLayers(p=>({...p, localities: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-750">CAIs Policía</span>
                                            <input type="checkbox" checked={mapLayers.cais} onChange={e => setMapLayers(p=>({...p, cais: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-755">Obras IDU</span>
                                            <input type="checkbox" checked={mapLayers.construction} onChange={e => setMapLayers(p=>({...p, construction: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-755">Accidentes</span>
                                            <input type="checkbox" checked={mapLayers.accidents} onChange={e => setMapLayers(p=>({...p, accidents: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-755">Robos 24h</span>
                                            <input type="checkbox" checked={mapLayers.robberies} onChange={e => setMapLayers(p=>({...p, robberies: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-755">Trancones</span>
                                            <input type="checkbox" checked={mapLayers.trafficJams} onChange={e => setMapLayers(p=>({...p, trafficJams: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1 border-b border-slate-50">
                                            <span className="text-slate-755">Semáforos</span>
                                            <input type="checkbox" checked={mapLayers.trafficLights} onChange={e => setMapLayers(p=>({...p, trafficLights: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                        <label className="flex justify-between items-center py-1">
                                            <span className="text-slate-755">Reportes Ciudadanos</span>
                                            <input type="checkbox" checked={mapLayers.citizenReports} onChange={e => setMapLayers(p=>({...p, citizenReports: e.target.checked}))} className="accent-emerald-600 w-3.5 h-3.5"/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Mobile Bottom Sheet - hidden during active navigation */}
            {isMobile && !isNavigating && !isMobileSearchOpen && (generatedRoutes.length > 0 || selectedSegmentId || isReporting || mobileActiveTab === 'citizen') && (
                <div 
                    className={`fixed bottom-0 left-4 right-4 z-40 md:hidden backdrop-blur-md rounded-t-3xl shadow-2xl transition-all duration-300 ease-in-out flex flex-col max-w-[calc(100vw-2rem)] mx-auto ${
                        isBottomSheetExpanded ? 'h-[55vh]' : 'h-16'
                    }`}
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        color: 'var(--text-on-surface)'
                    }}
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
                                        : isReporting
                                            ? 'Nuevo Reporte Ciudadano'
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
                        {isBottomSheetExpanded && (
                            <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl mb-4">
                                <button
                                    onClick={() => setMobileActiveTab('results')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none ${
                                        mobileActiveTab === 'results' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'text-slate-650 hover:bg-slate-200/60'
                                    }`}
                                    style={mobileActiveTab === 'results' ? { background: '#059669', color: '#fff' } : {}}
                                >
                                    <i className="fa-solid fa-route"></i> Ruta
                                </button>
                                <button
                                    onClick={() => setMobileActiveTab('cpted')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none ${
                                        mobileActiveTab === 'cpted' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'text-slate-650 hover:bg-slate-200/60'
                                    }`}
                                    style={mobileActiveTab === 'cpted' ? { background: '#059669', color: '#fff' } : {}}
                                >
                                    <i className="fa-solid fa-sliders"></i> CPTED
                                </button>
                                <button
                                    onClick={() => setMobileActiveTab('services')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none ${
                                        mobileActiveTab === 'services' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'text-slate-650 hover:bg-slate-200/60'
                                    }`}
                                    style={mobileActiveTab === 'services' ? { background: '#059669', color: '#fff' } : {}}
                                >
                                    <i className="fa-solid fa-traffic-light"></i> Servicios
                                </button>
                            </div>
                        )}

                        {/* Switch Panel Contents */}
                        {(!isBottomSheetExpanded || mobileActiveTab === 'results') && (
                            <div className="flex flex-col gap-4">
                                {resultsPanelComponent}
                                {isBottomSheetExpanded && navigationControlsComponent}
                                {viewMode === 'tech' && (
                                    <div className="mt-2 border-t border-slate-200 pt-4">
                                        {statsPanelComponent}
                                    </div>
                                )}
                            </div>
                        )}
                        {isBottomSheetExpanded && mobileActiveTab === 'cpted' && simulatorPanelComponent}
                        {isBottomSheetExpanded && mobileActiveTab === 'services' && (
                            <div className="flex flex-col gap-4">
                                {trafficLightsPanelComponent}
                                <div className="border-t border-slate-200 pt-4 my-2">
                                    {citizenSciencePanelComponent}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* ==================== DESKTOP LAYOUT (md: relative flex-row) ==================== */}

            {/* 5. Desktop Floating Header – hidden during active navigation */}
            {!isMobile && !isNavigating && !leftDrawerOpen && (
                <div className="hidden md:block">
                    {headerComponent}
                </div>
            )}

            {/* 6. Desktop Left Drawer – hidden during active 3D navigation */}
            {!isMobile && !isNavigating && (
                <div className={`floating-drawer left-drawer ${leftDrawerOpen ? 'open' : 'closed'} hidden md:flex`}>
                    <div className="sidebar-tabs-vertical">
                        <button 
                            onClick={() => setActiveTab('routes')} 
                            className={`tab-vertical-btn ${activeTab === 'routes' ? 'active' : ''}`}
                            title="Planificador de Rutas"
                        >
                            <i className="fa-solid fa-map-location-dot"></i>
                        </button>
                        <button 
                            onClick={() => setActiveTab('cpted')} 
                            className={`tab-vertical-btn ${activeTab === 'cpted' ? 'active' : ''}`}
                            title="CPTED y Simulación"
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </button>
                        <button 
                            onClick={() => setActiveTab('citizen')} 
                            className={`tab-vertical-btn ${activeTab === 'citizen' ? 'active' : ''}`}
                            title="Ciencia Ciudadana"
                        >
                            <i className="fa-solid fa-people-group"></i>
                        </button>
                        <button 
                            onClick={() => setActiveTab('lights')} 
                            className={`tab-vertical-btn ${activeTab === 'lights' ? 'active' : ''}`}
                            title="Semáforos e Intersecciones"
                        >
                            <i className="fa-solid fa-traffic-light"></i>
                        </button>
                        <button 
                            onClick={() => setActiveTab('nav')} 
                            className={`tab-vertical-btn ${activeTab === 'nav' ? 'active' : ''}`}
                            title="Navegación 3D"
                        >
                            <i className="fa-solid fa-bicycle"></i>
                        </button>
                        
                        {/* Spacer to push dark mode button to the bottom */}
                        <div className="flex-grow"></div>
                        
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="tab-vertical-btn"
                            title={darkMode ? "Modo Claro" : "Modo Oscuro"}
                            style={{ color: darkMode ? '#eab308' : 'var(--text-secondary)' }}
                        >
                            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                    </div>

                    <div className="drawer-content scrollable">
                        {activeTab === 'routes' && (
                            <>
                                {routePlannerComponent}
                                {generatedRoutes.length > 0 && (
                                    <>
                                        <div className="drawer-divider"></div>
                                        {resultsPanelComponent}
                                        {viewMode === 'tech' && (
                                            <>
                                                <div className="drawer-divider"></div>
                                                {statsPanelComponent}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {activeTab === 'cpted' && (
                            <>
                                {simulatorPanelComponent}
                                {selectedSegmentId && (
                                    <>
                                        <div className="drawer-divider"></div>
                                        {resultsPanelComponent}
                                        {viewMode === 'tech' && (
                                            <>
                                                <div className="drawer-divider"></div>
                                                {statsPanelComponent}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {activeTab === 'citizen' && citizenSciencePanelComponent}
                        {activeTab === 'lights' && trafficLightsPanelComponent}
                        {activeTab === 'nav' && navigationControlsComponent}
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

            {/* 8. Desktop Floating Footer (Bottom centered) – hidden during navigation */}
            {!isMobile && !isNavigating && (
                <footer className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-slate-500 text-center bg-white/80 py-1.5 px-4 rounded-full border border-slate-200/50 backdrop-blur shadow-sm">
                    <p><strong>Ruta Clara v1.0.0 (MVP)</strong> • Semillero Construcción de software para la transformación del territorio</p>
                </footer>
            )}

            {/* 9. Cockpit HUD Overlay during 3D Navigation */}
            {cockpitHUD}
        </div>
    );
}
