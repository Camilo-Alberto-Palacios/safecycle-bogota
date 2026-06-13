// Risk Calculator Engine for SafeCycle Bogotá (CPTED + Historical Crime)

export function calculateRisk(segment) {
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

    // Total risk score
    let totalScore = baseValue + shapCrime + shapWeather + shapLightingTech + shapLightingPower + shapVisibility + shapGuardians;
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
            'Guardianes (CAI/Ruta)': shapGuardians
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
export function evaluateCoordinateRisk(lat, lng, bikeSegments, simulationState) {
    const nearest = findNearestSegment({ lat, lng }, bikeSegments);
    const baseValue = 5.0;

    let shapCrime = 0.0;
    const baseline = nearest ? nearest.baselineCrime : 'Medio';
    if (baseline === 'Alto') shapCrime = 2.4;
    else if (baseline === 'Medio') shapCrime = 0.2;
    else if (baseline === 'Bajo') shapCrime = -2.1;

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

    return { score, level };
}

// Calculate the average risk and max risk levels across route coordinates
export function calculateRouteAverageRisk(coords, bikeSegments, simulationState) {
    let totalScore = 0;
    let maxScore = 0;
    const step = Math.max(1, Math.floor(coords.length / 20)); // Sample coordinates
    let count = 0;
    
    for (let i = 0; i < coords.length; i += step) {
        const pt = coords[i];
        const risk = evaluateCoordinateRisk(pt[0], pt[1], bikeSegments, simulationState);
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

    // Default good feedback if segment has low risk
    if (prediction.level === 'Bajo') {
        recs.push({
            text: '<strong>Entorno Seguro:</strong> El diseño físico actual (luminarias eficientes y visibilidad óptima) cumple con las directrices internacionales CPTED.',
            warning: false
        });
    }

    return recs;
}

// Generate recommendations specific to a route
export function getRouteRecommendations(route, simulationState, generatedRoutes) {
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
