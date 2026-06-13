import React from 'react';

export default function RouteCard({
    route,
    isActive,
    onClick
}) {
    let riskClass = 'risk-low';
    let riskText = 'Bajo';
    
    const scoreNum = parseFloat(route.avgRiskScore);
    if (scoreNum >= 7.0) {
        riskClass = 'risk-high';
        riskText = 'Alto';
    } else if (scoreNum >= 3.8) {
        riskClass = 'risk-mid';
        riskText = 'Medio';
    }

    return (
        <div 
            className={`route-card ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="route-card-header">
                <span className="route-card-title">{route.name}</span>
                <span className="route-card-meta">{route.distanceKm} km • {route.durationMin} min</span>
            </div>
            <div className="route-card-risk">
                <span className="route-card-meta">Riesgo Promedio:</span>
                <span className={riskClass}>{route.avgRiskScore} ({riskText})</span>
            </div>
        </div>
    );
}
