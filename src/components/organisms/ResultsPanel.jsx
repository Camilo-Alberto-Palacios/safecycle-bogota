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
    totalDelayMinutes = 0,
    onStartNavigation
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

                            {/* PRIMARY ACTION — always first and visible */}
                            <button
                                onClick={() => onStartNavigation && onStartNavigation('gps')}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.8rem 1rem',
                                    marginBottom: '0.85rem',
                                    fontWeight: '700',
                                    fontSize: '0.92rem',
                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                    border: 'none',
                                    color: '#ffffff',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
                                    letterSpacing: '0.02em'
                                }}
                                title="Navegar usando tu ubicación GPS en tiempo real"
                            >
                                <i className="fa-solid fa-diamond-turn-right"></i> Cómo Llegar
                            </button>

                            {/* Route alternatives */}
                            <h4 style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className="fa-solid fa-list-ol text-accent"></i> Rutas disponibles
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

                            {/* Secondary: simulation link */}
                            <button
                                onClick={() => onStartNavigation && onStartNavigation('simulated')}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    padding: '0.4rem 0.75rem',
                                    marginTop: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.72rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(148,163,184,0.25)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}
                                title="Ver simulación animada del recorrido"
                            >
                                <i className="fa-solid fa-play" style={{ fontSize: '0.6rem' }}></i> Ver Simulación
                            </button>
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

