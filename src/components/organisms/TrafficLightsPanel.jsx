import React from 'react';
import Button from '../atoms/Button';

export default function TrafficLightsPanel({
    trafficLights = [],
    localidad,
    activeRoute,
    onToggleAutoCycle,
    autoCycleActive,
    onForceGreenWave,
    greenWaveActive,
    onToggleLightState
}) {
    // Filter traffic lights for the active locality
    const activeLocalityLights = trafficLights.filter(light => light.localidad === localidad);

    // Helper to check if a traffic light is close to the active route (within ~40 meters)
    const isLightOnRoute = (light) => {
        if (!activeRoute || !activeRoute.coordinates) return false;
        
        return activeRoute.coordinates.some(pt => {
            const distDeg = Math.sqrt(
                Math.pow(pt[0] - light.coordinates[0], 2) + 
                Math.pow(pt[1] - light.coordinates[1], 2)
            );
            return (distDeg * 111000) <= 40; // 40 meters threshold
        });
    };

    // Lights on the active route
    const routeLights = trafficLights.filter(isLightOnRoute);

    const getStatusColor = (state) => {
        if (state === 'verde') return '#10b981'; // Emerald
        if (state === 'amarillo') return '#eab308'; // Amber
        return '#ef4444'; // Red
    };

    const getStatusText = (state) => {
        if (state === 'verde') return 'Verde (Paso Libre)';
        if (state === 'amarillo') return 'Amarillo (Precaución)';
        return 'Rojo (Detención)';
    };

    return (
        <div className="traffic-lights-panel-card animate-fade-in">
            <h3>
                <i className="fa-solid fa-traffic-light text-accent"></i> Semáforos e Intersecciones
            </h3>
            <p className="traffic-lights-desc">
                Gestión en tiempo real de la red semafórica y cruces seguros en la ciclorruta.
            </p>

            {/* Smart Traffic Controls */}
            <div className="smart-traffic-controls" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexDirection: 'column' }}>
                    <button
                        className={`btn-flat ${autoCycleActive ? 'btn-flat-primary' : 'btn-flat-secondary'}`}
                        onClick={onToggleAutoCycle}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <i className={`fa-solid ${autoCycleActive ? 'fa-pause' : 'fa-play'}`}></i>
                        {autoCycleActive ? 'Pausar Ciclo Automático' : 'Iniciar Ciclo Automático'}
                    </button>
                    
                    <button
                        className={`btn-flat ${greenWaveActive ? 'btn-flat-success' : 'btn-flat-warning'}`}
                        onClick={onForceGreenWave}
                        disabled={!activeRoute || greenWaveActive}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            opacity: activeRoute ? 1 : 0.5,
                            cursor: activeRoute ? 'pointer' : 'not-allowed'
                        }}
                        title={!activeRoute ? "Calcula una ruta para activar la onda verde" : "Priorizar paso seguro ciclista"}
                    >
                        <i className="fa-solid fa-wave-square"></i>
                        {greenWaveActive ? 'Onda Verde Ciclista Activa (15s)' : 'Forzar Onda Verde en Ruta'}
                    </button>
                </div>
            </div>

            {/* Active Route Lights Summary */}
            {activeRoute && (
                <div className="route-lights-summary" style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    marginBottom: '1.25rem'
                }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <i className="fa-solid fa-circle-check"></i> Semáforos en tu Ruta ({routeLights.length})
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                        {routeLights.length > 0 
                            ? `Se detectaron ${routeLights.length} intersecciones semaforizadas. Usa la simulación en 3D para aproximarte a ellas.`
                            : "No se detectaron semáforos en el trazado de la ruta seleccionada."}
                    </p>
                </div>
            )}

            {/* List of active locality traffic lights */}
            <div className="traffic-lights-list-section">
                <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                    Red Semafórica Local ({activeLocalityLights.length})
                </h4>
                
                <div className="traffic-lights-scroll-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                }}>
                    {activeLocalityLights.map(light => {
                        const onRoute = isLightOnRoute(light);
                        return (
                            <div 
                                key={light.id} 
                                className="traffic-light-item-card" 
                                style={{
                                    background: 'var(--card-bg-light, rgba(255,255,255,0.03))',
                                    border: onRoute ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    padding: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                        <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                            {light.intersection}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                            Tipo: {light.type === 'vehicular_ciclista' ? 'Vehicular + Bici' : 'Vehicular'}
                                        </span>
                                    </div>
                                    {onRoute && (
                                        <span style={{
                                            fontSize: '0.6rem',
                                            background: '#10b981',
                                            color: '#fff',
                                            fontWeight: '700',
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '20px'
                                        }}>
                                            En Ruta
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: getStatusColor(light.state),
                                            boxShadow: `0 0 8px ${getStatusColor(light.state)}`
                                        }}></span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: getStatusColor(light.state) }}>
                                            {getStatusText(light.state)}
                                        </span>
                                    </div>

                                    {/* Action manual toggle buttons */}
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button 
                                            onClick={() => onToggleLightState(light.id, 'verde')}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#10b981',
                                                border: light.state === 'verde' ? '2px solid #fff' : 'none',
                                                cursor: 'pointer',
                                                opacity: light.state === 'verde' ? 1 : 0.4
                                            }}
                                            title="Cambiar a Verde"
                                        />
                                        <button 
                                            onClick={() => onToggleLightState(light.id, 'amarillo')}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#eab308',
                                                border: light.state === 'amarillo' ? '2px solid #fff' : 'none',
                                                cursor: 'pointer',
                                                opacity: light.state === 'amarillo' ? 1 : 0.4
                                            }}
                                            title="Cambiar a Amarillo"
                                        />
                                        <button 
                                            onClick={() => onToggleLightState(light.id, 'rojo')}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                border: light.state === 'rojo' ? '2px solid #fff' : 'none',
                                                cursor: 'pointer',
                                                opacity: light.state === 'rojo' ? 1 : 0.4
                                            }}
                                            title="Cambiar a Rojo"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
