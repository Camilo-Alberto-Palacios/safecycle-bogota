import React from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';

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
    isLoading
}) {
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
            />
            
            <FormField
                value={destInput}
                onChange={onDestInputChange}
                placeholder="Destino: clic mapa o buscar..."
                iconClass="fa-solid fa-location-dot text-red"
                onSelectOnMap={() => onSelectLocationModeChange('destination')}
                isSelecting={selectingLocationMode === 'destination'}
                title="Fijar destino en el mapa"
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
        </div>
    );
}
