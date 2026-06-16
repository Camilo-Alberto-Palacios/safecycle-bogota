import React from 'react';
import RouteCard from '../molecules/RouteCard';

export default function ResultsPanel({
    prediction,
    hasRoute,
    generatedRoutes = [],
    activeRouteId,
    onSelectRoute,
    recommendations = [],
    viewMode,
    trafficJamsOnRoute = [],
    totalDelayMinutes = 0
}) {
    const isTech = viewMode === 'tech';

    // Helper for risk classes
    const getRiskClass = (level) => {
        const clean = String(level).toLowerCase();
        if (clean === 'bajo' || clean === 'low') return 'risk-low';
        if (clean === 'medio' || clean === 'mid') return 'risk-mid';
        return 'risk-high';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'severo') return '🔴';
        if (severity === 'moderado') return '🟠';
        return '🟡';
    };

    const getSeverityColor = (severity) => {
        if (severity === 'severo') return '#dc2626';
        if (severity === 'moderado') return '#f97316';
        return '#eab308';
    };

    return (
        <div className="panel prediction-panel">
            <div className={`prediction-main ${hasRoute ? 'has-route' : ''}`}>
                
                {/* Risk Gauge */}
                <div className="risk-gauge-container">
                    <div className="risk-label">Riesgo Estimado</div>
                    <div id="val-risk-level" className={`risk-level ${getRiskClass(prediction.level)}`}>
                        {prediction.level}
                    </div>
                    {isTech && (
                        <div className="risk-score tech-only">
                            Puntaje de Riesgo: <span id="val-risk-score">{prediction.score}</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="prediction-content-area" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Route Alternatives List (only shown if route is plotted) */}
                    {hasRoute && generatedRoutes.length > 0 && (
                        <div id="route-comparison-box" className="route-comparison-box">
                            <h4>
                                <i className="fa-solid fa-list-ol text-accent"></i> Rutas Propuestas
                            </h4>
                            <div id="list-route-alternatives" className="route-alternatives-list">
                                {generatedRoutes.map((route) => (
                                    <RouteCard
                                        key={route.id}
                                        route={route}
                                        isActive={route.id === activeRouteId}
                                        onClick={() => onSelectRoute(route.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Traffic Jams Section */}
                    {hasRoute && trafficJamsOnRoute.length > 0 && (
                        <div className="traffic-jams-section">
                            <h4>
                                <i className="fa-solid fa-car" style={{ color: '#f97316' }}></i> Trancones en tu Ruta
                            </h4>
                            <ul className="traffic-jams-list">
                                {trafficJamsOnRoute.map((detected, idx) => (
                                    <li key={idx} className="traffic-jam-item">
                                        <div className="tj-header">
                                            <span className="tj-severity-icon">{getSeverityIcon(detected.severity)}</span>
                                            <span className="tj-name">{detected.jam.name}</span>
                                        </div>
                                        <div className="tj-details">
                                            <div className="tj-route-info">
                                                <span className="tj-from">
                                                    <i className="fa-solid fa-circle-play" style={{ color: '#10b981', fontSize: '0.6rem', marginRight: '0.3rem' }}></i>
                                                    {detected.fromName}
                                                </span>
                                                <span className="tj-arrow">→</span>
                                                <span className="tj-to">
                                                    <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', fontSize: '0.6rem', marginRight: '0.3rem' }}></i>
                                                    {detected.toName}
                                                </span>
                                            </div>
                                            <div className="tj-delay" style={{ color: getSeverityColor(detected.severity) }}>
                                                +{detected.delayMinutes} min
                                            </div>
                                        </div>
                                        <div className="tj-source">
                                            Fuente: {detected.jam.source} • Reportado: {detected.jam.reportedTime}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="tj-total-delay">
                                <i className="fa-solid fa-clock"></i>
                                <span>Demora total por trancones: <strong>+{totalDelayMinutes} min</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Box */}
                    <div className="recommendations-box">
                        <h4>
                            <i className="fa-solid fa-triangle-exclamation text-yellow"></i> Recomendaciones de Infraestructura
                            {isTech && <span className="tech-only"> CPTED</span>}
                        </h4>
                        <ul id="list-recommendations" className="recommendations-list">
                            {recommendations.length > 0 ? (
                                recommendations.map((rec, idx) => (
                                    <li 
                                        key={idx} 
                                        className={rec.warning ? 'warning' : ''}
                                        dangerouslySetInnerHTML={{ __html: rec.text }}
                                    />
                                ))
                            ) : (
                                <li>Selecciona un tramo de ciclorruta o calcula una ruta para ver las sugerencias de mitigación.</li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

