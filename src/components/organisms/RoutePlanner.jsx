import React from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Switch from '../atoms/Switch';

export default function RoutePlanner({
    originInput,
    onOriginInputChange,
    destInput,
    onDestInputChange,
    selectingLocationMode,
    onSelectLocationModeChange,
    onCalculateRoute,
    onClearRoute,
    hasRoute,
    isLoading,
    onSelectOriginLocation,
    onSelectDestLocation,
    mapLayers = { localities: true, cais: true, construction: true, accidents: true, robberies: true },
    onMapLayersChange
}) {
    const handleToggle = (key, val) => {
        if (onMapLayersChange) {
            onMapLayersChange(prev => ({
                ...prev,
                [key]: val
            }));
        }
    };

    return (
        <div className="route-planner-card">
            <h3>
                <i className="fa-solid fa-route text-accent"></i> Planificador de Rutas
            </h3>
            <p className="route-planner-desc">
                Busca direcciones o haz clic en el mapa para definir origen y destino.
            </p>
            
            <FormField
                value={originInput}
                onChange={onOriginInputChange}
                placeholder="Origen: clic mapa o buscar..."
                iconClass="fa-solid fa-circle-play text-green"
                onSelectOnMap={() => onSelectLocationModeChange('origin')}
                isSelecting={selectingLocationMode === 'origin'}
                title="Fijar origen en el mapa"
                onSelectLocation={onSelectOriginLocation}
                showGpsButton={true}
            />
            
            <FormField
                value={destInput}
                onChange={onDestInputChange}
                placeholder="Destino: clic mapa o buscar..."
                iconClass="fa-solid fa-location-dot text-red"
                onSelectOnMap={() => onSelectLocationModeChange('destination')}
                isSelecting={selectingLocationMode === 'destination'}
                title="Fijar destino en el mapa"
                onSelectLocation={onSelectDestLocation}
                showGpsButton={false}
            />
            
            <div className="route-buttons-row">
                <Button
                    variant="primary"
                    onClick={onCalculateRoute}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin margin-right-xs"></i> Procesando...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-compass"></i> Calcular Ruta
                        </>
                    )}
                </Button>
                {hasRoute && (
                    <Button
                        variant="secondary"
                        onClick={onClearRoute}
                        id="btn-clear-route"
                    >
                        <i className="fa-solid fa-trash-can"></i> Limpiar
                    </Button>
                )}
            </div>

            {/* Map Layer Selector Controls */}
            <div className="map-layers-section" style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-layer-group text-accent"></i> Capas del Mapa
                </h4>
                <div className="layer-switches-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-map text-muted" style={{ marginRight: '0.4rem', width: '12px' }}></i> Límites de Localidades
                        </span>
                        <Switch
                            id="layer-switch-localities"
                            checked={mapLayers.localities}
                            onChange={(val) => handleToggle('localities', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-shield-halved text-blue" style={{ marginRight: '0.4rem', width: '12px', color: '#38bdf8' }}></i> CAIs de Policía
                        </span>
                        <Switch
                            id="layer-switch-cais"
                            checked={mapLayers.cais}
                            onChange={(val) => handleToggle('cais', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-person-digging text-orange" style={{ marginRight: '0.4rem', width: '12px', color: '#f97316' }}></i> Zonas de Obra (IDU)
                        </span>
                        <Switch
                            id="layer-switch-construction"
                            checked={mapLayers.construction}
                            onChange={(val) => handleToggle('construction', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-car-burst text-yellow" style={{ marginRight: '0.4rem', width: '12px', color: '#eab308' }}></i> Accidentes Recientes
                        </span>
                        <Switch
                            id="layer-switch-accidents"
                            checked={mapLayers.accidents}
                            onChange={(val) => handleToggle('accidents', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-mask text-red" style={{ marginRight: '0.4rem', width: '12px', color: '#ef4444' }}></i> Robos Últimas 24h
                        </span>
                        <Switch
                            id="layer-switch-robberies"
                            checked={mapLayers.robberies}
                            onChange={(val) => handleToggle('robberies', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-car text-orange" style={{ marginRight: '0.4rem', width: '12px', color: '#f97316' }}></i> Trancones en Tiempo Real
                        </span>
                        <Switch
                            id="layer-switch-traffic-jams"
                            checked={mapLayers.trafficJams}
                            onChange={(val) => handleToggle('trafficJams', val)}
                        />
                    </div>
                    <div className="layer-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-people-group text-accent" style={{ marginRight: '0.4rem', width: '12px' }}></i> Reportes Ciudadanos
                        </span>
                        <Switch
                            id="layer-switch-citizen-reports"
                            checked={mapLayers.citizenReports}
                            onChange={(val) => handleToggle('citizenReports', val)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
