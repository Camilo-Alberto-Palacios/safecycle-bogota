// Risk Calculator Engine for SafeCycle Bogotá (CPTED + Historical Crime + Active Construction Zones)

// Helper to calculate citizen risk impact based on user reports
export function calcularRiesgoCiudadano(tramoId, citizenReports = [], bikeSegments = {}) {
    if (!tramoId || !citizenReports || citizenReports.length === 0) return 0;
    
    const segment = bikeSegments[tramoId];
    if (!segment || !segment.coordinates || segment.coordinates.length === 0) return 0;
    
    let totalImpact = 0;
    
    // Filter active reports
    const activeReports = citizenReports.filter(r => r.properties && r.properties.estado === 'activo');
    
    activeReports.forEach(report => {
        const reportCoords = report.properties.coordenadas; // [lat, lng]
        if (!reportCoords) return;
        
        // Calculate distance from report to segment's polyline
        let minDistance = Infinity;
        segment.coordinates.forEach(pt => {
            const distDeg = Math.sqrt(Math.pow(pt[0] - reportCoords[0], 2) + Math.pow(pt[1] - reportCoords[1], 2));
            const distMeters = distDeg * 111000;
            if (distMeters < minDistance) {
                minDistance = distMeters;
            }
        });
        
        // If within 50 meters
        if (minDistance <= 50) {
            let baseWeight = 0;
            const type = report.properties.tipo_novedad;
            
            if (type.includes('Luminaria') || type.includes('lobo')) {
                baseWeight = 0.8;
            } else if (type.includes('Hueco') || type.includes('destructiva')) {
                baseWeight = 0.5;
            } else if (type.includes('Inseguridad') || type.includes('Atraco')) {
                baseWeight = 1.5;
            }
            
            // Upvoting rule: if > 10 votes, multiply by 1.25
            if (report.properties.numero_votos > 10) {
                baseWeight *= 1.25;
            }
            
            totalImpact += baseWeight;
        }
    });
    
    return totalImpact;
}

// Helper para calcular el impacto de riesgo por frentes de obra IDU
export function getConstructionRiskImpact(lat, lng, constructionZones = [], enabled = true) {
    if (!enabled || !constructionZones || constructionZones.length === 0) return 0;
    
    let totalImpact = 0;
    constructionZones.forEach(zone => {
        // Distancia aproximada en metros: 1 grado ≈ 111,000 metros
        const distDeg = Math.sqrt(Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2));
        const distMeters = distDeg * 111000;
        if (distMeters <= zone.radius) {
            totalImpact += zone.riskWeight;
        }
    });
    
    // Limitamos el impacto máximo de obras a un incremento de +2.5
    return Math.min(2.5, totalImpact);
}

export function calculateRisk(segment, constructionZones = [], showConstruction = true, citizenReports = [], bikeSegments = {}, trafficLights = []) {
    const baseValue = 5.0;

    // A. Historic Crime Baseline (SIEDCO)
    let shapCrime = 0.0;
    if (segment.baselineCrime === 'Alto') shapCrime = 2.4;
    else if (segment.baselineCrime === 'Medio') shapCrime = 0.2;
    else if (segment.baselineCrime === 'Bajo') shapCrime = -2.1;

    // B. Weather (IDIGER)
    const shapWeather = (segment.weather === 'lluvia') ? 1.4 : -0.3;

    // C. Public Lighting Tech (UAESP)
    const shapLightingTech = (segment.lightingType === 'Sodio') ? 0.7 : -0.8;

    // D. Public Lighting Power (UAESP)
    const wattsVal = segment.watts || 100;
    const shapLightingPower = 0.4 - ((wattsVal - 50) / 200) * 1.1;

    // E. Visibility / Obstacles (CPTED)
    let shapVisibility = 0.0;
    if (segment.visibility === 1) shapVisibility = 0.9;
    else if (segment.visibility === 3) shapVisibility = -1.0;

    // F. Guardians
    const shapCai = segment.guardianCai ? -1.3 : 0.0;
    const shapRuta = segment.guardianRuta ? -0.9 : 0.0;
    const shapGuardians = shapCai + shapRuta;

    // G. Frente de Obra (IDU)
    // Calculado en las coordenadas de inicio del tramo
    const startCoord = segment.coordinates[0];
    const shapConstruction = getConstructionRiskImpact(startCoord[0], startCoord[1], constructionZones, showConstruction);

    // H. Trancones (Waze) & Accidentes (CRUE) en Tiempo Real
    const shapTrafficJams = segment.trafficJams ? 0.7 : -0.2;
    const shapAccidents = segment.accidents ? 1.5 : 0.0;

    // I. Citizen Reports
    const citizenRisk = calcularRiesgoCiudadano(segment.id, citizenReports, bikeSegments);

    // J. Traffic Lights dynamic impact
    let shapTrafficLight = 0.0;
    if (trafficLights && trafficLights.length > 0 && startCoord) {
        const nearbyLight = trafficLights.find(light => {
            const distDeg = Math.sqrt(Math.pow(startCoord[0] - light.coordinates[0], 2) + Math.pow(startCoord[1] - light.coordinates[1], 2));
            return (distDeg * 111000) <= 30;
        });
        if (nearbyLight) {
            if (nearbyLight.state === 'verde') shapTrafficLight = -0.6;
            else if (nearbyLight.state === 'rojo') shapTrafficLight = 0.5;
        }
    }

    // Total risk score
    let totalScore = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + shapGuardians + shapConstruction + shapTrafficJams + shapAccidents + citizenRisk + shapTrafficLight;
    totalScore = Math.max(0.5, Math.min(9.5, totalScore));

    let level = 'Bajo';
    if (totalScore >= 7.0) level = 'Alto';
    else if (totalScore >= 3.8) level = 'Medio';

    return {
        score: totalScore.toFixed(1),
        level: level,
        shaps: {
            'Historial (SIEDCO)': shapCrime,
            'Clima (IDIGER)': shapWeather,
            'Tipo Luz (UAESP)': shapLightingTech,
            'Potencia (UAESP)': shapLightingPower,
            'Visibilidad (CPTED)': shapVisibility,
            'Guardianes (CAI/Ruta)': shapGuardians,
            'Frente Obra (IDU)': shapConstruction,
            'Trancones (Waze)': shapTrafficJams,
            'Accidentes (CRUE)': shapAccidents,
            'Riesgo Ciudadano': citizenRisk,
            'Semáforo Dinámico': shapTrafficLight
        }
    };
}

// Find nearest pre-defined segment to a given coordinate
export function findNearestSegment(latlng, bikeSegments) {
    let nearestSeg = null;
    let minDist = Infinity;
    
    Object.keys(bikeSegments).forEach(id => {
        const segment = bikeSegments[id];
        if (segment.id === 'custom_audit') return;
        
        const start = segment.coordinates[0];
        const dist = Math.sqrt(Math.pow(latlng.lat - start[0], 2) + Math.pow(latlng.lng - start[1], 2));
        if (dist < minDist) {
            minDist = dist;
            nearestSeg = segment;
        }
    });
    
    return nearestSeg;
}

// Evaluate coordinate risk using current simulation state
export function evaluateCoordinateRisk(lat, lng, bikeSegments, simulationState, constructionZones = [], showConstruction = true, citizenReports = [], trafficLights = []) {
    const nearest = findNearestSegment({ lat, lng }, bikeSegments);
    const baseValue = 5.0;

    let shapCrime = 0.0;
    const baseline = nearest ? nearest.baselineCrime : 'Medio';
    if (baseline === 'Alto') shapCrime = 2.4;
    else if (baseline === 'Medio') shapCrime = 0.2;
    else if (baseline === 'Bajo') shapCrime = -2.1;

    const { weather, lightingType, watts, visibility, guardianCai, guardianRuta, trafficJams, accidents } = simulationState;

    const shapWeather = (weather === 'lluvia') ? 1.4 : -0.3;
    const shapLightingTech = (lightingType === 'Sodio') ? 0.7 : -0.8;
    const shapLightingPower = 0.4 - ((watts - 50) / 200) * 1.1;

    let shapVisibility = 0.0;
    if (visibility === 1) shapVisibility = 0.9;
    else if (visibility === 3) shapVisibility = -1.0;

    const shapCai = guardianCai ? -1.3 : 0.0;
    const shapRuta = guardianRuta ? -0.9 : 0.0;

    // Frente de Obra (IDU)
    const shapConstruction = getConstructionRiskImpact(lat, lng, constructionZones, showConstruction);

    // Trancones (Waze) & Accidentes (CRUE) en Tiempo Real
    const shapTrafficJams = trafficJams ? 0.7 : -0.2;
    const shapAccidents = accidents ? 1.5 : 0.0;

    // Citizen Reports
    const citizenRisk = nearest ? calcularRiesgoCiudadano(nearest.id, citizenReports, bikeSegments) : 0;

    // Traffic Lights dynamic impact
    let shapTrafficLight = 0.0;
    if (trafficLights && trafficLights.length > 0) {
        const nearbyLight = trafficLights.find(light => {
            const distDeg = Math.sqrt(Math.pow(lat - light.coordinates[0], 2) + Math.pow(lng - light.coordinates[1], 2));
            return (distDeg * 111000) <= 30;
        });
        if (nearbyLight) {
            if (nearbyLight.state === 'verde') shapTrafficLight = -0.6;
            else if (nearbyLight.state === 'rojo') shapTrafficLight = 0.5;
        }
    }

    let score = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + (shapCai + shapRuta) + shapConstruction + shapTrafficJams + shapAccidents + citizenRisk + shapTrafficLight;
    score = Math.max(0.5, Math.min(9.5, score));

    let level = 'Bajo';
    if (score >= 7.0) level = 'Alto';
    else if (score >= 3.8) level = 'Medio';

    return { score: score.toFixed(1), level };
}

// Calculate the average risk and max risk levels across route coordinates
export function calculateRouteAverageRisk(coords, bikeSegments, simulationState, constructionZones = [], showConstruction = true, citizenReports = [], trafficLights = []) {
    let totalScore = 0;
    let maxScore = 0;
    const step = Math.max(1, Math.floor(coords.length / 20)); // Sample coordinates
    let count = 0;
    
    for (let i = 0; i < coords.length; i += step) {
        const pt = coords[i];
        const risk = evaluateCoordinateRisk(pt[0], pt[1], bikeSegments, simulationState, constructionZones, showConstruction, citizenReports, trafficLights);
        const scoreNum = parseFloat(risk.score);
        totalScore += scoreNum;
        if (scoreNum > maxScore) {
            maxScore = scoreNum;
        }
        count++;
    }
    
    const avgScore = (totalScore / count).toFixed(1);
    let maxLevel = 'Bajo';
    if (maxScore >= 7.0) maxLevel = 'Alto';
    else if (maxScore >= 3.8) maxLevel = 'Medio';
    
    return { avgScore, maxLevel };
}

// Calculate the dynamic routing cost based on the formula: Costo_i = Distancia_i * (1 + Riesgo_Base_i + Riesgo_Ciudadano_i)
export function calculateRouteCost(coords, bikeSegments, simulationState, constructionZones = [], showConstruction = true, citizenReports = [], trafficLights = []) {
    if (!coords || coords.length < 2) return 0;
    
    let totalCost = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        const pt1 = coords[i];
        const pt2 = coords[i+1];
        
        // Approximate distance in km
        const distDeg = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
        const distKm = distDeg * 111.0;
        
        // Midpoint coordinates to evaluate risk
        const midLat = (pt1[0] + pt2[0]) / 2;
        const midLng = (pt1[1] + pt2[1]) / 2;
        
        // Evaluate risk at midpoint
        const risk = evaluateCoordinateRisk(midLat, midLng, bikeSegments, simulationState, constructionZones, showConstruction, citizenReports, trafficLights);
        const riskScore = parseFloat(risk.score);
        
        // Costo_i = Distancia_i * (1 + Riesgo_i)
        // Note: Puntaje_Riesgo_Base_i + Puntaje_Riesgo_Ciudadano_i is exactly equal to the total risk score computed.
        totalCost += distKm * (1 + riskScore);
    }
    return totalCost;
}

// Generate CPTED & Infrastructure recommendations dynamically
export function getRecommendations(segment, prediction, simulationState) {
    const recs = [];
    const { weather, lightingType, watts, visibility } = simulationState;

    // 1. Weather related recommendation
    if (weather === 'lluvia') {
        recs.push({
            text: '<strong>Lluvia:</strong> Despliegue de patrullas móviles en horarios pico, ya que la lluvia reduce un 40% el flujo ciclista y la vigilancia natural.',
            warning: true
        });
    }

    // 2. Lighting Tech related recommendation
    if (lightingType === 'Sodio') {
        recs.push({
            text: '<strong>Iluminación:</strong> Reemplazar la luminaria de Sodio por tecnología LED. Esto reduce el riesgo en un ~12% al mejorar la reproducción cromática del entorno.',
            warning: true
        });
    }

    // 3. Lighting Power related recommendation
    if (watts < 150) {
        recs.push({
            text: `<strong>Potencia Lumínica:</strong> Incrementar la potencia del alumbrado (actualmente en ${watts}W) a un estándar de 150W o superior para eliminar puntos ciegos.`,
            warning: true
        });
    }

    // 4. Visibility CPTED recommendation
    if (visibility === 1) {
        recs.push({
            text: '<strong>Vigilancia Natural:</strong> Realizar poda de árboles y limpieza de laderas obstaculizadoras para asegurar líneas de visión despejadas ("ver y ser visto").',
            warning: true
        });
    } else if (visibility === 2) {
        recs.push({
            text: '<strong>Vigilancia Natural:</strong> Se aconseja mantenimiento preventivo regular del follaje circundante para evitar que tape las luminarias.',
            warning: false
        });
    }

    // 5. Guardian recommendation if risk is high
    if (prediction.level === 'Alto' && !segment.guardianCai && !segment.guardianRuta) {
        recs.push({
            text: '<strong>Urgente:</strong> Establecer este tramo como prioridad de patrullaje preventivo del Plan Bogotá Camina Segura, o bien instalar un CAI móvil.',
            warning: true
        });
    }

    // 6. Recomendación de frentes de obra IDU
    if (prediction.shaps && prediction.shaps['Frente Obra (IDU)'] > 0) {
        recs.push({
            text: '<strong>Frente de Obra Vial (IDU):</strong> Sector con polisombras y restricciones de paso que bloquean la vigilancia natural. Se recomienda redoblar la alerta, usar luces de alta potencia en la bicicleta y transitar con precaución en desvíos temporales.',
            warning: true
        });
    }

    // Default good feedback if segment has low risk
    if (prediction.level === 'Bajo' && (!prediction.shaps || prediction.shaps['Frente Obra (IDU)'] === 0) && !simulationState.trafficJams && !simulationState.accidents) {
        recs.push({
            text: '<strong>Entorno Seguro:</strong> El diseño físico actual (luminarias eficientes y visibilidad óptima) cumple con las directrices internacionales CPTED.',
            warning: false
        });
    }

    // 7. Trancones en Tiempo Real
    if (simulationState.trafficJams) {
        recs.push({
            text: '<strong>Congestión Vial (Trancones):</strong> El tráfico vehicular lento o detenido puede propiciar hurtos rápidos de oportunidad en ciclorrutas paralelas y la invasión de ciclistas/motos. Mantente alerta.',
            warning: true
        });
    }

    // 8. Accidentes en Tiempo Real
    if (simulationState.accidents) {
        recs.push({
            text: '<strong>Siniestro Vial Reciente:</strong> Se reporta un accidente en la calzada. Modera la velocidad, anticípate a obstrucciones y evita desvíos arriesgados.',
            warning: true
        });
    }

    return recs;
}

// Generate recommendations specific to a route
export function getRouteRecommendations(route, simulationState, generatedRoutes, constructionZones = [], showConstruction = true) {
    const recs = [];
    const { weather, lightingType, watts } = simulationState;

    recs.push({
        text: `<strong>Resumen de Trayecto:</strong> Ruta de ${route.distanceKm} km (${route.durationMin} min) con un índice de riesgo promedio de <strong>${route.avgRiskScore}</strong>.`,
        warning: false
    });

    if (route.maxRiskLevel === 'Alto') {
        recs.push({
            text: '<strong>Puntos Críticos Detectados:</strong> Esta ruta cruza tramos catalogados como de Alto Riesgo. Se sugiere transitar con precaución o activar patrullas móviles.',
            warning: true
        });
    }

    if (lightingType === 'Sodio') {
        recs.push({
            text: '<strong>Alumbrado Público:</strong> La ruta tiene luminarias de Sodio. Cambiarlas a LED a nivel distrital reduciría el riesgo promedio de atraco un ~12%.',
            warning: true
        });
    }

    if (watts < 150) {
        recs.push({
            text: '<strong>Potencia Lumínica:</strong> Se detectaron sectores con wattaje deficiente. Incrementar la potencia eliminará zonas oscuras en curvas ciegas.',
            warning: true
        });
    }

    if (weather === 'lluvia') {
        recs.push({
            text: '<strong>Alerta Clima:</strong> La lluvia reduce el flujo peatonal. Si viajas en estas condiciones, prefiere rutas principales con patrullaje activo.',
            warning: true
        });
    }

    // Obras IDU en la ruta
    const hasConstructionOnRoute = showConstruction && constructionZones.some(zone => {
        return route.coordinates.some(pt => {
            const distDeg = Math.sqrt(Math.pow(pt[0] - zone.lat, 2) + Math.pow(pt[1] - zone.lng, 2));
            return (distDeg * 111000) <= zone.radius;
        });
    });

    if (hasConstructionOnRoute) {
        recs.push({
            text: '<strong>Frentes de Obra Activos (IDU):</strong> Esta ruta atraviesa zonas de obra con desvíos y barreras físicas. Extrema precauciones por presencia de maquinaria y polisombras.',
            warning: true
        });
    }

    if (simulationState.trafficJams) {
        recs.push({
            text: '<strong>Tránsito Crítico en Ruta:</strong> Alta congestión reportada en la vía. Mantente en la ciclorruta y ten cuidado con motos que puedan invadir el espacio.',
            warning: true
        });
    }

    if (simulationState.accidents) {
        recs.push({
            text: '<strong>Siniestro en Trayecto:</strong> Reporte de accidente activo en el trazado de la ruta. Circula con extrema precaución.',
            warning: true
        });
    }

    // Check if it's the safest route
    const safestRoute = generatedRoutes.reduce((prev, curr) => parseFloat(prev.avgRiskScore) < parseFloat(curr.avgRiskScore) ? prev : curr);
    if (route.id === safestRoute.id && generatedRoutes.length > 1) {
        recs.push({
            text: '<strong>Ruta Recomendada:</strong> Has seleccionado la alternativa de menor exposición al delito del sistema.',
            warning: false
        });
    } else if (generatedRoutes.length > 1) {
        recs.push({
            text: `<strong>Sugerencia de Seguridad:</strong> La ${safestRoute.name} tiene un riesgo menor (${safestRoute.avgRiskScore}). Considera seleccionarla.`,
            warning: false
        });
    }

    return recs;
}

// Detect traffic jams that overlap with a route's coordinates
export function detectTrafficJamsOnRoute(routeCoords, trafficJams, thresholdMeters = 100) {
    if (!routeCoords || routeCoords.length === 0 || !trafficJams || trafficJams.length === 0) {
        return [];
    }

    const detected = [];

    trafficJams.forEach(jam => {
        const affectedIndices = new Set();
        let isOnRoute = false;

        // For each segment of the jam polyline, check against route points
        for (let j = 0; j < jam.coordinates.length; j++) {
            const jamPt = jam.coordinates[j];

            for (let r = 0; r < routeCoords.length; r++) {
                const routePt = routeCoords[r];
                // Approximate distance in meters (1 degree ≈ 111,000 meters)
                const distDeg = Math.sqrt(
                    Math.pow(routePt[0] - jamPt[0], 2) + Math.pow(routePt[1] - jamPt[1], 2)
                );
                const distMeters = distDeg * 111000;

                if (distMeters <= thresholdMeters) {
                    isOnRoute = true;
                    affectedIndices.add(r);
                }
            }
        }

        if (isOnRoute) {
            const indices = Array.from(affectedIndices).sort((a, b) => a - b);
            detected.push({
                jam: jam,
                affectedSegments: indices,
                startIndex: indices[0],
                endIndex: indices[indices.length - 1],
                delayMinutes: jam.delayMinutes,
                fromName: jam.fromName,
                toName: jam.toName,
                severity: jam.severity
            });
        }
    });

    return detected;
}
