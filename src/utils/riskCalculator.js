// Risk Calculator Engine for SafeCycle Bogotá (CPTED + Historical Crime + Active Construction Zones)

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

export function calculateRisk(segment, constructionZones = [], showConstruction = true) {
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

    // Total risk score
    let totalScore = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + shapGuardians + shapConstruction + shapTrafficJams + shapAccidents;
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
            'Accidentes (CRUE)': shapAccidents
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
export function evaluateCoordinateRisk(lat, lng, bikeSegments, simulationState, constructionZones = [], showConstruction = true) {
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

    let score = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + (shapCai + shapRuta) + shapConstruction + shapTrafficJams + shapAccidents;
    score = Math.max(0.5, Math.min(9.5, score));

    let level = 'Bajo';
    if (score >= 7.0) level = 'Alto';
    else if (score >= 3.8) level = 'Medio';

    return { score, level };
}

// Calculate the average risk and max risk levels across route coordinates
export function calculateRouteAverageRisk(coords, bikeSegments, simulationState, constructionZones = [], showConstruction = true) {
    let totalScore = 0;
    let maxScore = 0;
    const step = Math.max(1, Math.floor(coords.length / 20)); // Sample coordinates
    let count = 0;
    
    for (let i = 0; i < coords.length; i += step) {
        const pt = coords[i];
        const risk = evaluateCoordinateRisk(pt[0], pt[1], bikeSegments, simulationState, constructionZones, showConstruction);
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
